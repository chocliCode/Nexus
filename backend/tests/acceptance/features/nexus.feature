Feature: Validacion de Flujos de Negocio de NEXUS (Pruebas de Aceptacion)

  Como usuario de la plataforma NEXUS
  Quiero poder interactuar con los diferentes modulos del sistema
  Para gestionar mis OKRs, postulaciones, sesiones y datos de perfil

  # =======================================================
  # Modulo: Autenticacion
  # =======================================================
  Scenario: UAT-01 Un usuario puede registrarse en el sistema
    Given que el sistema esta activo
    When un nuevo usuario envia sus datos de registro "nuevo@nexus.com" y contrasena "Pass123!"
    Then el sistema debe registrar al usuario y retornar un token
    And el status de la respuesta debe ser 201

  Scenario: UAT-02 Un admin puede iniciar sesion
    Given que existe un administrador en el sistema con email "admin@nexus.com" y contrasena "admin123"
    When el administrador intenta iniciar sesion
    Then el sistema debe retornar un token JWT de acceso
    And el status de la respuesta debe ser 200

  Scenario: UAT-03 Un padawan puede iniciar sesion
    Given que existe un padawan en el sistema con email "padawan1@nexus.com" y contrasena "password123"
    When el padawan intenta iniciar sesion
    Then el sistema debe retornar un token JWT de acceso

  # =======================================================
  # Modulo: Perfil
  # =======================================================
  Scenario: UAT-04 Un usuario puede obtener los datos de su perfil
    Given que el usuario inicio sesion
    When el usuario solicita su propio perfil
    Then el sistema debe devolver los detalles del perfil actual
    And la respuesta debe contener los nombres del usuario

  # =======================================================
  # Modulo: OKRs
  # =======================================================
  Scenario: UAT-05 Crear un nuevo OKR
    Given que el usuario inicio sesion
    When el usuario crea un OKR con titulo "Aprender Testing" y meta 10
    Then el OKR debe ser creado exitosamente
    And el status de la respuesta debe ser 201

  Scenario: UAT-06 Obtener lista de OKRs del usuario
    Given que el usuario inicio sesion y tiene OKRs
    When el usuario solicita su lista de OKRs
    Then el sistema debe devolver una lista de OKRs
    And la lista no debe estar vacia

  Scenario: UAT-07 Actualizar un OKR
    Given que el usuario inicio sesion y tiene un OKR especifico
    When el usuario actualiza el valor actual a 5
    Then el sistema confirma la actualizacion
    And el status de la respuesta debe ser 200

  Scenario: UAT-08 Eliminar un OKR
    Given que el usuario inicio sesion y creo un OKR para eliminar
    When el usuario solicita eliminar dicho OKR
    Then el OKR se elimina del sistema
    And el status de la respuesta debe ser 200

  # =======================================================
  # Modulo: Vacantes
  # =======================================================
  Scenario: UAT-09 Un admin puede publicar una vacante
    Given que un admin inicio sesion
    When el admin publica una vacante "Desarrollador Junior"
    Then la vacante debe ser creada
    And el status de la respuesta debe ser 201

  Scenario: UAT-10 Un usuario puede buscar vacantes
    Given que existen vacantes en el sistema
    When el usuario busca vacantes por modalidad "Remoto"
    Then el sistema devuelve las vacantes correspondientes

  # =======================================================
  # Modulo: Sesiones de Mentoria
  # =======================================================
  Scenario: UAT-11 Un padawan puede ver sus sesiones asignadas
    Given que un padawan inicio sesion
    When el padawan solicita su lista de sesiones
    Then el sistema retorna un arreglo con sus sesiones

  Scenario: UAT-12 Un admin puede agendar una sesion a un padawan
    Given que un admin inicio sesion
    When el admin programa una sesion "Revision OKRs"
    Then el sistema confirma la programacion

  # =======================================================
  # Modulo: Notificaciones
  # =======================================================
  Scenario: UAT-13 Un usuario puede ver sus notificaciones
    Given que el usuario inicio sesion
    When el usuario consulta sus notificaciones no leidas
    Then el sistema debe devolver una respuesta exitosa
    And la respuesta contiene el campo "total"

  # =======================================================
  # Modulo: Dashboard e IA
  # =======================================================
  Scenario: UAT-14 Un admin puede consultar el riesgo de abandono
    Given que un admin inicio sesion
    When el admin solicita la evaluacion de riesgo general
    Then el sistema de IA analiza y devuelve la clasificacion
    And el status de la respuesta debe ser 200

  Scenario: UAT-15 Un admin puede ver estadisticas del dashboard
    Given que un admin inicio sesion
    When el admin consulta el endpoint del dashboard
    Then el sistema devuelve estadisticas de usuarios y completitud
