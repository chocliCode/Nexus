# NEXUS -- Instrucciones para configurar Branch Protection Rulesets
# Este archivo documenta los rulesets que debes crear en GitHub.
# Ve a: Settings > Rules > Rulesets > New ruleset > "New branch ruleset"

# ═══════════════════════════════════════════════════════════════════
# RULESET 1: "Develop Gate" (feature/* → develop)
# ═══════════════════════════════════════════════════════════════════
#
# 1. En GitHub: Settings > Rules > Rulesets > "New branch ruleset"
# 2. Nombre:         Develop Gate
# 3. Enforcement:    Active
# 4. Target:         Include by pattern → develop
#
# REGLAS A ACTIVAR:
#
# [x] Restrict deletions
# [x] Require a pull request before merging
#     - Required approvals: 1
#     - [x] Dismiss stale reviews
# [x] Require status checks to pass
#     - [x] Require branches to be up to date
#     - Status checks that are required:
#         ✅ "📋 Lint & TypeScript"
#         ✅ "🎯 Unitarias Backend (160)"
#         ✅ "🎨 Componente UI (45)"
#         ✅ "🔒 Seguridad OWASP (45)"
#         ✅ "💨 Humo / Smoke (45)"
#         ✅ "📊 Develop Gate — Resumen"
# [x] Block force pushes
#
# ═══════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════════
# RULESET 2: "Main Gate" (develop → main)
# ═══════════════════════════════════════════════════════════════════
#
# 1. En GitHub: Settings > Rules > Rulesets > "New branch ruleset"
# 2. Nombre:         Main Gate
# 3. Enforcement:    Active
# 4. Target:         Include by pattern → main
#
# REGLAS A ACTIVAR:
#
# [x] Restrict deletions
# [x] Require a pull request before merging
#     - Required approvals: 1
#     - [x] Dismiss stale reviews
# [x] Require status checks to pass
#     - [x] Require branches to be up to date
#     - Status checks that are required:
#         ✅ "🔄 Integracion API + DB (45)"
#         ✅ "✅ Aceptacion BDD (45)"
#         ✅ "🌐 E2E Playwright (30)"
#         ✅ "🚀 Main Gate — Veredicto"
#     - (Los siguientes son informativos, NO los marques como required):
#         ⚠️ "📈 Carga / Load (Artillery)"
#         ⚠️ "💥 Estres / Stress (Artillery)"
# [x] Block force pushes
#
# ═══════════════════════════════════════════════════════════════════
