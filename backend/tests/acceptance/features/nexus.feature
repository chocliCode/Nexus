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
    Given que existe un administrador en el sistema con email "admin@nexus.test" y contrasena "Test1234!"
    When el administrador intenta iniciar sesion
    Then el sistema debe retornar un token JWT de acceso
    And el status de la respuesta debe ser 200

  Scenario: UAT-03 Un padawan puede iniciar sesion
    Given que existe un padawan en el sistema con email "padawan@nexus.test" y contrasena "Test1234!"
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

  # =======================================================
  # Modulo: Cursos
  # =======================================================
  Scenario: UAT-CRS-01 Un Jedi crea un curso exitosamente
    Given que un Jedi ha iniciado sesion
    When el Jedi envia el formulario de creacion de curso con titulo "Testing BDD"
    Then el sistema debe registrar el curso
    And el status de la creacion debe ser 201

  Scenario: UAT-CRS-02 Validar que los campos obligatorios de curso son requeridos
    Given que un Jedi ha iniciado sesion
    When el Jedi envia el formulario de creacion de curso sin titulo
    Then el sistema debe rechazar la peticion por validacion
    And el status de la creacion debe ser 400

  Scenario: UAT-CRS-03 El curso creado aparece en el dashboard del Jedi
    Given que un Jedi ha iniciado sesion
    When el Jedi consulta la lista de sus cursos
    Then el sistema devuelve la lista que incluye el curso recien creado

  # =======================================================
  # Modulo: Tareas (Aula Virtual)
  # =======================================================
  Scenario: UAT-TSK-01 Un Mentor crea una tarea con fecha de cierre
    Given que un Mentor ha iniciado sesion
    And tiene un curso activo
    When el Mentor publica una tarea con titulo "Entregable 1" y fecha de cierre
    Then el sistema registra la tarea en el feed del curso
    And el status de la tarea creada es 201

  Scenario: UAT-TSK-02 Una tarea sin fecha es rechazada
    Given que un Mentor ha iniciado sesion
    And tiene un curso activo
    When el Mentor publica una tarea sin fecha de cierre
    Then el sistema rechaza la solicitud
    And el status de la tarea creada es 400

  Scenario: UAT-TSK-03 Un Padawan ve la tarea en su feed
    Given que un Padawan esta inscrito en el curso
    When el Padawan accede al feed del aula virtual
    Then el sistema retorna un arreglo con las publicaciones
    And el arreglo incluye la tarea publicada

  # =======================================================
  # Modulo: Resolucion de Tareas (Subir PDF)
  # =======================================================
  Scenario: UAT-PDF-01 Padawan sube su resolucion en PDF a tiempo
    Given que un Padawan tiene una tarea pendiente
    When el Padawan envia un archivo PDF como solucion
    Then el sistema registra la entrega exitosamente
    And el status de la entrega es 201

  Scenario: UAT-PDF-02 Padawan intenta subir un archivo que no es PDF
    Given que un Padawan tiene una tarea pendiente
    When el Padawan envia un archivo bash malicioso
    Then el sistema bloquea la carga del archivo
    And el status de la entrega es 400

  Scenario: UAT-PDF-03 El Mentor visualiza la tarea entregada
    Given que el Padawan entrego su solucion
    When el Mentor consulta las entregas de la tarea
    Then la respuesta incluye el archivo PDF del Padawan

  # =======================================================
  # Modulo: Calificaciones y Reportes
  # =======================================================
  Scenario: UAT-GRD-01 Mentor califica la tarea de un alumno exitosamente
    Given que hay una entrega pendiente de revision
    When el Mentor envia la calificacion "18"
    Then el sistema actualiza la entrega
    And el status de la peticion es 200

  Scenario: UAT-GRD-02 Mentor solicita exportar las notas del curso
    Given que el curso tiene alumnos con calificaciones
    When el Mentor solicita descargar el reporte CSV
    Then el sistema genera y devuelve el archivo

  Scenario: UAT-GRD-03 Validacion de rangos de calificacion
    Given que hay una entrega pendiente de revision
    When el Mentor intenta asignar una nota "25"
    Then el sistema rechaza la calificacion
    And el status de la peticion es 400
