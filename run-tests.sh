#!/usr/bin/env bash
# ============================================================
# NEXUS -- Script local de regresion completa
# Replica TODAS las etapas de ci.yml (Gate 1 + Gate 2)
# ============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PASS=0
FAIL=0
SKIP=0

export NODE_ENV=test
export DATABASE_URL="${DATABASE_URL:-postgresql://nexus_user:nexus_pass@localhost:5432/nexus_test}"
export JWT_SECRET="${JWT_SECRET:-test_secret_ci_2026}"
export PGPASSWORD="${PGPASSWORD:-nexus_pass}"

# ── Helpers ──────────────────────────────────────────────────
section() {
  echo ""
  echo "==========================================================="
  echo "  $1"
  echo "==========================================================="
}

run_step() {
  local label="$1"
  shift
  echo ">>> $label"
  if "$@"; then
    echo "[OK] $label"
    ((PASS++))
  else
    echo "[FAIL] $label"
    ((FAIL++))
  fi
}

DB_AVAILABLE=false
if pg_isready -U nexus_user -d nexus_test -q 2>/dev/null; then
  DB_AVAILABLE=true
fi

BACKEND_PID=""
cleanup_backend() {
  if [[ -n "$BACKEND_PID" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
    BACKEND_PID=""
  fi
}
trap cleanup_backend EXIT

start_backend() {
  cleanup_backend
  echo ">>> Inicializando base de datos de test..."
  (cd "$ROOT_DIR/backend" && npx ts-node -e "require('./tests/globalSetup.ts').default()")
  echo ">>> Iniciando backend en background..."
  (cd "$ROOT_DIR/backend" && npm run dev &)
  BACKEND_PID=$!
  sleep 5
  curl -sf http://localhost:3001/api/v1/health || echo "Health check no disponible (continuando)"
}

# ============================================================
# GATE 1 — DEVELOP (Shift-Left, sin DB)
# ============================================================

# 1. LINT & TYPECHECK
section "1/10  Analisis Estatico (Lint & Types)"
run_step "Backend Typecheck" bash -c "cd '$ROOT_DIR/backend' && npm ci --silent && npx tsc --noEmit"
run_step "Frontend Linting"  bash -c "cd '$ROOT_DIR/frontend' && npm ci --silent && npm run lint"

# 2. PRUEBAS UNITARIAS
section "2/10  Unitarias Backend (160)"
run_step "Unit Tests" bash -c "cd '$ROOT_DIR/backend' && npm run test:unit -- --verbose --coverage"

# 3. PRUEBAS DE COMPONENTE UI
section "3/10  Componente UI (Vitest)"
run_step "Component Tests" bash -c "cd '$ROOT_DIR/frontend' && npx vitest run --reporter=verbose"

# 4. PRUEBAS DE SEGURIDAD
section "4/10  Seguridad OWASP"
run_step "Security Tests" bash -c "cd '$ROOT_DIR/backend' && npm run test:security -- --verbose"

# 5. PRUEBAS DE HUMO
section "5/10  Humo / Smoke"
run_step "Smoke Tests" bash -c "cd '$ROOT_DIR/backend' && npm run test:smoke -- --verbose"

# ============================================================
# GATE 2 — MAIN (Release, requiere PostgreSQL)
# ============================================================

# 6. PRUEBAS DE INTEGRACION
section "6/10  Integracion API + DB (45)"
if $DB_AVAILABLE; then
  run_step "Integration Tests" bash -c "cd '$ROOT_DIR/backend' && npm test -- --runInBand --verbose"
else
  echo "[SKIP] PostgreSQL no disponible -- omitiendo integracion"
  echo "       Levanta la DB con:  docker compose up -d postgres"
  ((SKIP++))
fi

# 7. PRUEBAS DE ACEPTACION BDD
section "7/10  Aceptacion BDD (45)"
if $DB_AVAILABLE; then
  run_step "Acceptance BDD Tests" bash -c "cd '$ROOT_DIR/backend' && npm run test:acceptance -- --verbose"
else
  echo "[SKIP] PostgreSQL no disponible -- omitiendo aceptacion BDD"
  ((SKIP++))
fi

# 8. PRUEBAS END-TO-END (Playwright)
section "8/10  End-to-End (Playwright)"
if $DB_AVAILABLE; then
  echo ">>> Instalando Chromium para Playwright..."
  (cd "$ROOT_DIR/frontend" && npx playwright install --with-deps chromium)

  start_backend
  run_step "E2E Tests" bash -c "cd '$ROOT_DIR/frontend' && npx playwright test --reporter=list"
  cleanup_backend
else
  echo "[SKIP] PostgreSQL no disponible -- omitiendo E2E"
  ((SKIP++))
fi

# 9. PRUEBAS DE CARGA (Artillery)
section "9/10  Carga / Load (Artillery)"
if $DB_AVAILABLE; then
  start_backend
  run_step "Load Auth"  bash -c "cd '$ROOT_DIR/backend' && npx artillery run tests/load/load-auth.yml || true"
  run_step "Load Mixed" bash -c "cd '$ROOT_DIR/backend' && npx artillery run tests/load/load-mixed.yml || true"
  cleanup_backend
else
  echo "[SKIP] PostgreSQL no disponible -- omitiendo carga"
  ((SKIP++))
fi

# 10. PRUEBAS DE ESTRES (Artillery)
section "10/10  Estres / Stress (Artillery)"
if $DB_AVAILABLE; then
  start_backend
  run_step "Stress Limits" bash -c "cd '$ROOT_DIR/backend' && npx artillery run tests/stress/stress-limits.yml || true"
  run_step "Stress Spike"  bash -c "cd '$ROOT_DIR/backend' && npx artillery run tests/stress/stress-spike.yml || true"
  cleanup_backend
else
  echo "[SKIP] PostgreSQL no disponible -- omitiendo estres"
  ((SKIP++))
fi

# ============================================================
# REPORTE FINAL
# ============================================================
section "Generacion de Reporte Excel"
run_step "Generate Excel Report" bash -c "cd '$ROOT_DIR/backend' && node tests/qa-scripts/generate_excel.js"

# ============================================================
# RESUMEN
# ============================================================
echo ""
echo "==========================================================="
echo "  RESUMEN — REGRESION COMPLETA"
echo "==========================================================="
echo "  Pasaron:   $PASS"
echo "  Fallaron:  $FAIL"
echo "  Omitidos:  $SKIP"
echo "==========================================================="

if [[ $FAIL -gt 0 ]]; then
  echo "❌ Regresion FALLIDA"
  exit 1
else
  echo "✅ Regresion APROBADA"
fi
