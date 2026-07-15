import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { courseService } from '../services/api';
import { BookOpen, Users, Megaphone, Send, Pin, Trash2, MessageSquare, GraduationCap, ArrowLeft, FileText, ClipboardList, ClipboardCheck, Download, Plus, Upload, File, Paperclip } from 'lucide-react';

interface CoursePost {
  post_id: string;
  curso_id: string;
  autor_id: string;
  tipo: string;
  titulo: string | null;
  contenido: string;
  fijado: boolean;
  fecha_creacion: string;
  autor_nombres?: string;
  autor_apellidos?: string;
  autor_rol?: string;
  comentarios?: Comment[];
  url_enlace?: string;
  archivo_url?: string;
  archivo_nombre?: string;
  archivos?: Array<{ url: string; nombre: string; tipo: string }>;
}

interface Comment {
  comentario_id: string;
  contenido: string;
  fecha_creacion: string;
  autor_id: string;
  autor_nombres: string;
  autor_apellidos: string;
  autor_rol: string;
}

interface Grade {
  calificacion_id: string;
  padawan_id: string;
  padawan_nombres: string;
  padawan_apellidos: string;
  evaluacion: string;
  nota: number;
  nota_maxima: number;
  comentario: string;
  fecha_calificacion: string;
}

interface Submission {
  entrega_id: string;
  post_id: string;
  padawan_id: string;
  archivo_url: string;
  comentarios: string;
  fecha_entrega: string;
  nombres: string;
  apellidos: string;
  email: string;
}

interface Student {
  usuario_id: string;
  nombres: string;
  apellidos: string;
  email: string;
  fecha_inscripcion: string;
}

interface CourseDetail {
  curso_id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  jedi_id: string;
  jedi_nombre: string;
  max_estudiantes: number;
  inscritos: string;
  ya_inscrito: boolean;
}

const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #1a73e8 0%, #4285f4 50%, #669df6 100%)',
  'linear-gradient(135deg, #0d652d 0%, #1e8e3e 50%, #34a853 100%)',
  'linear-gradient(135deg, #e37400 0%, #f9ab00 50%, #fdd663 100%)',
  'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 50%, #ce93d8 100%)',
  'linear-gradient(135deg, #00695c 0%, #009688 50%, #4db6ac 100%)',
  'linear-gradient(135deg, #c62828 0%, #e53935 50%, #ef5350 100%)',
];

const getGradient = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return BANNER_GRADIENTS[Math.abs(h) % BANNER_GRADIENTS.length];
};

const TIPO_ICONS: Record<string, React.ElementType> = {
  anuncio: Megaphone,
  material: FileText,
  tarea: ClipboardList,
  examen: ClipboardCheck,
  discusion: MessageSquare
};

const TIPO_LABELS: Record<string, string> = {
  anuncio: 'Anuncio',
  material: 'Material',
  tarea: 'Tarea',
  examen: 'Examen',
  discusion: 'Discusión'
};


type Tab = 'novedades' | 'estudiantes' | 'calificaciones';

export default function CourseClassroomPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [posts, setPosts] = useState<CoursePost[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [tab, setTab] = useState<Tab>('novedades');
  const [loading, setLoading] = useState(true);

  // New post form
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({ tipo: 'anuncio', titulo: '', contenido: '', url_enlace: '', fecha_vencimiento: '' });
  const [postFiles, setPostFiles] = useState<globalThis.File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Comment forms
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<string | null>(null);

  // Grades modal
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeForm, setGradeForm] = useState({ padawan_id: '', titulo: '', nota: 0, nota_maxima: 20, comentario: '', submissionId: '' });

  // Submissions Modals
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionPostId, setSubmissionPostId] = useState<string | null>(null);
  const [submissionFile, setSubmissionFile] = useState<globalThis.File | null>(null);
  const [submissionComment, setSubmissionComment] = useState('');
  
  const [showSubmissionsListModal, setShowSubmissionsListModal] = useState(false);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);

  const isJedi = course?.jedi_id === user?.usuario_id;

  const loadData = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, feedRes, studentsRes, gradesRes] = await Promise.all([
        courseService.getById(courseId),
        courseService.getFeed(courseId),
        courseService.getStudents(courseId),
        courseService.getGrades(courseId),
      ]);
      setCourse(courseRes.data.data);
      setPosts(feedRes.data.data);
      setStudents(studentsRes.data.data);
      setGrades(gradesRes.data.data);
    } catch {
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const reloadGrades = async () => {
    if (!courseId) return;
    try {
      const res = await courseService.getGrades(courseId);
      setGrades(res.data.data);
    } catch { /* silent */ }
  };

  const reloadFeed = async () => {
    if (!courseId) return;
    try {
      const res = await courseService.getFeed(courseId);
      setPosts(res.data.data);
    } catch { /* silent */ }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { void loadData(); }, [courseId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !postForm.contenido.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tipo', postForm.tipo);
      formData.append('contenido', postForm.contenido);
      if (postForm.titulo.trim()) formData.append('titulo', postForm.titulo.trim());
      if (postForm.tipo === 'examen' && postForm.url_enlace.trim()) formData.append('url_enlace', postForm.url_enlace.trim());
      if (postForm.tipo === 'tarea' && postForm.fecha_vencimiento.trim()) formData.append('fecha_vencimiento', postForm.fecha_vencimiento.trim());
      postFiles.forEach(file => {
        formData.append('archivos', file);
      });
      
      const res = await courseService.createPost(courseId, formData);
      setPosts([res.data.data, ...posts]);
      setPostForm({ tipo: 'anuncio', titulo: '', contenido: '', url_enlace: '', fecha_vencimiento: '' });
      setPostFiles([]);
      setShowPostForm(false);
      await reloadFeed();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await courseService.deletePost(postId);
      await reloadFeed();
    } catch { /* silent */ }
  };

  const handleTogglePin = async (postId: string) => {
    try {
      await courseService.togglePin(postId);
      await reloadFeed();
    } catch { /* silent */ }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    setCommentSubmitting(postId);
    try {
      await courseService.addComment(postId, text);
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      await reloadFeed();
    } catch { /* silent */ }
    finally { setCommentSubmitting(null); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await courseService.deleteComment(commentId);
      await reloadFeed();
    } catch { /* silent */ }
  };

  const handleCreateGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    if (!gradeForm.submissionId) {
      alert('Para calificar a este alumno, primero debe subir su entrega.');
      return;
    }
    setSubmitting(true);
    try {
      await courseService.gradeSubmission(gradeForm.submissionId, {
        nota: gradeForm.nota,
        feedback_mentor: gradeForm.comentario
      });
      setShowGradeModal(false);
      setGradeForm({ padawan_id: '', titulo: '', nota: 0, nota_maxima: 20, comentario: '', submissionId: '' });
      await reloadGrades();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleExportGrades = async () => {
    if (!courseId) return;
    try {
      const res = await courseService.exportGrades(courseId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `notas_curso_${courseId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch { /* silent */ }
  };

  const handleOpenSubmissionModal = (postId: string) => {
    setSubmissionPostId(postId);
    setSubmissionFile(null);
    setSubmissionComment('');
    setShowSubmissionModal(true);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionPostId || !submissionFile) return;
    
    if (!window.confirm("¿Estás seguro de enviar esta tarea? Asegúrate de que el archivo es el correcto.")) {
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('archivo', submissionFile);
      formData.append('comentarios', submissionComment);
      await courseService.submitAssignment(submissionPostId, formData);
      setShowSubmissionModal(false);
      // Optional: reload something or show success toast
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleViewSubmissions = async (postId: string) => {
    try {
      const res = await courseService.getAssignmentSubmissions(postId);
      setSubmissionsList(res.data.data);
      setShowSubmissionsListModal(true);
    } catch { /* silent */ }
  };

  const handleGradeFromSubmission = (sub: Submission) => {
    // Busca el titulo del post para prellenarlo
    const post = posts.find(p => p.post_id === sub.post_id);
    setGradeForm({ 
      padawan_id: sub.padawan_id, 
      titulo: post?.titulo || 'Tarea', 
      nota: 0, 
      nota_maxima: 20, 
      comentario: '',
      submissionId: sub.entrega_id
    });
    setShowSubmissionsListModal(false);
    setShowGradeModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 rounded-full animate-spin"
             style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!course || !courseId) return null;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'novedades', label: 'Novedades', icon: <Megaphone className="w-4 h-4" /> },
    { key: 'estudiantes', label: `Estudiantes (${students.length})`, icon: <Users className="w-4 h-4" /> },
    { key: 'calificaciones', label: 'Calificaciones', icon: <ClipboardCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="animate-fade-in -mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
      {/* Banner */}
      <div className="relative p-6 pb-16" style={{ background: getGradient(courseId), minHeight: '140px' }}>
        <button onClick={() => navigate('/courses')}
                className="text-xs text-white/80 hover:text-white mb-2 inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a cursos
        </button>
        <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">{course.titulo}</h1>
        <div className="flex items-center gap-3 mt-1.5">
          <p className="text-sm text-white/80 flex items-center gap-1">
            <GraduationCap className="w-4 h-4" /> {course.jedi_nombre}
          </p>
          {course.categoria && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/20 text-white">
              {course.categoria}
            </span>
          )}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/20 text-white">
            {course.estado}
          </span>
        </div>
        {course.descripcion && (
          <p className="text-sm text-white/70 mt-2 max-w-2xl">{course.descripcion}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 -mt-6 relative z-10">
        <div className="p-1 inline-flex gap-1 rounded-xl" style={{ backgroundColor: 'var(--surface-card)', boxShadow: 'var(--shadow-md)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                backgroundColor: tab === t.key ? 'var(--color-primary-500)' : 'transparent',
                color: tab === t.key ? '#fff' : 'var(--text-muted)',
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        {tab === 'novedades' && (
          <div className="max-w-3xl space-y-4">
            {/* New post button / form - ONLY FOR JEDI */}
            {isJedi && (
              !showPostForm ? (
                <button onClick={() => setShowPostForm(true)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl text-sm text-left transition-all hover:shadow-md"
                        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                       style={{ backgroundColor: 'var(--color-primary-500)' }}>
                    {user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}
                  </div>
                  Publica algo en el curso...
                </button>
              ) : (
                <form onSubmit={handleCreatePost}
                      className="rounded-2xl overflow-hidden"
                      style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)' }}>
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      <select value={postForm.tipo}
                              onChange={e => setPostForm(f => ({ ...f, tipo: e.target.value }))}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
                        <option value="anuncio">Anuncio</option>
                        <option value="material">Material</option>
                        <option value="tarea">Tarea</option>
                        <option value="examen">Examen</option>
                        <option value="discusion">Discusión</option>
                      </select>
                      <input value={postForm.titulo}
                             onChange={e => setPostForm(f => ({ ...f, titulo: e.target.value }))}
                             placeholder="Titulo (opcional)"
                             className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                              style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
                    </div>
                    {postForm.tipo === 'examen' && (
                      <input value={postForm.url_enlace}
                             onChange={e => setPostForm(f => ({ ...f, url_enlace: e.target.value }))}
                             placeholder="Enlace del formulario o examen"
                             className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
                              style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
                    )}
                    {postForm.tipo === 'tarea' && (
                      <input type="datetime-local" value={postForm.fecha_vencimiento}
                             onChange={e => setPostForm(f => ({ ...f, fecha_vencimiento: e.target.value }))}
                             className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
                              style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
                    )}
                    <textarea value={postForm.contenido}
                              onChange={e => setPostForm(f => ({ ...f, contenido: e.target.value }))}
                              placeholder="Escribe tu publicacion..."
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                              style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
                    
                    {/* File Attachment Input */}
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-500/10 transition-colors"
                               style={{ color: 'var(--text-secondary)' }}>
                          <Paperclip className="w-4 h-4" />
                          {postFiles.length > 0 ? 'Añadir más archivos' : 'Adjuntar archivos/imágenes'}
                          <input type="file" multiple className="hidden"
                                 accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                                 onChange={e => {
                                   if (e.target.files) {
                                     setPostFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                   }
                                 }} />
                        </label>
                      </div>
                      {postFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {postFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium" style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                              <span className="truncate max-w-[120px]">{f.name}</span>
                              <button type="button" onClick={() => setPostFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500">
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                    <button type="button" onClick={() => { setShowPostForm(false); setPostFiles([]); }}
                            className="px-4 py-1.5 rounded-lg text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={submitting || !postForm.contenido.trim()}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: 'var(--color-primary-500)' }}>
                      {submitting ? 'Publicando...' : 'Publicar'}
                    </button>
                  </div>
                </form>
              )
            )}

            {/* Posts feed */}
            {posts.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
                <BookOpen className="w-10 h-10" style={{ color: 'var(--color-primary-400)' }} />
                <p className="text-sm font-medium">No hay publicaciones todavia</p>
                <p className="text-xs">Se el primero en publicar algo en el curso.</p>
              </div>
            ) : (
              posts.map(post => {
                const PostIcon = TIPO_ICONS[post.tipo] || Megaphone;
                const isAuthor = post.autor_id === user?.usuario_id;
                const comments = post.comentarios || [];

                return (
                  <div key={post.post_id} className="rounded-2xl overflow-hidden"
                       style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)' }}>
                    {/* Post header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                               style={{ backgroundColor: post.autor_rol === 'Jedi' ? 'var(--color-primary-600)' : '#6366f1' }}>
                            {post.autor_nombres?.charAt(0)}{post.autor_apellidos?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {post.autor_nombres} {post.autor_apellidos}
                              {post.autor_rol === 'Jedi' && (
                                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">Profesor</span>
                              )}
                            </p>
                            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              {new Date(post.fecha_creacion).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              {' · '}
                              <span className="inline-flex items-center gap-0.5">
                                <PostIcon className="w-3 h-3" /> {TIPO_LABELS[post.tipo] || post.tipo}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {post.fijado && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">Fijado</span>
                          )}
                          {isJedi && (
                            <button onClick={() => handleTogglePin(post.post_id)}
                                    className="p-1 rounded hover:opacity-70" title={post.fijado ? 'Desfijar' : 'Fijar'}>
                              <Pin className="w-3.5 h-3.5" style={{ color: post.fijado ? '#eab308' : 'var(--text-muted)' }} />
                            </button>
                          )}
                          {(isAuthor || isJedi) && (
                            <button onClick={() => handleDeletePost(post.post_id)}
                                    className="p-1 rounded hover:opacity-70" title="Eliminar">
                              <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Post content */}
                      {post.titulo && (
                        <h3 className="font-bold text-base mt-3" style={{ color: 'var(--text-primary)' }}>{post.titulo}</h3>
                      )}
                      <p className="text-sm mt-2 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {post.contenido}
                      </p>

                      {/* Archivos Adjuntos */}
                      {post.archivos && post.archivos.length > 0 ? (
                        <div className="mt-4 space-y-2">
                          {post.archivos.map((archivo, i) => (
                            <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
                              {archivo.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                <img src={`http://localhost:3001${archivo.url}`} alt={archivo.nombre} className="w-full h-auto object-cover" style={{ maxHeight: '500px', display: 'block' }} />
                              ) : (
                                <div className="p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--surface-page)' }}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-card)' }}>
                                      <FileText className="w-5 h-5" style={{ color: 'var(--color-primary-500)' }} />
                                    </div>
                                    <div className="overflow-hidden">
                                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                        {archivo.nombre || 'Archivo Adjunto'}
                                      </p>
                                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Haz clic para descargar el archivo</p>
                                    </div>
                                  </div>
                                  <a href={`http://localhost:3001${archivo.url}`} target="_blank" rel="noreferrer"
                                     className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 whitespace-nowrap"
                                     style={{ backgroundColor: 'var(--color-primary-500)' }}>
                                    Descargar
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : post.archivo_url && (
                        <div className="mt-4 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
                          {post.archivo_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                            <img src={`http://localhost:3001${post.archivo_url}`} alt="Adjunto" className="w-full h-auto object-cover" style={{ maxHeight: '500px', display: 'block' }} />
                          ) : (
                            <div className="p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--surface-page)' }}>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-card)' }}>
                                  <FileText className="w-5 h-5" style={{ color: 'var(--color-primary-500)' }} />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                    {post.archivo_nombre || 'Archivo Adjunto'}
                                  </p>
                                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Haz clic para descargar el archivo</p>
                                </div>
                              </div>
                              <a href={`http://localhost:3001${post.archivo_url}`} target="_blank" rel="noreferrer"
                                 className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 whitespace-nowrap"
                                 style={{ backgroundColor: 'var(--color-primary-500)' }}>
                                Descargar
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Tarea actions */}
                      {post.tipo === 'tarea' && (
                        <div className="mt-4 p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)' }}>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-card)' }}>
                              <FileText className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Entregable de la Tarea</p>
                              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Formato requerido: PDF</p>
                            </div>
                          </div>
                          <div>
                            {isJedi ? (
                              <button onClick={() => handleViewSubmissions(post.post_id)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all">
                                Ver Entregas
                              </button>
                            ) : (
                              <button onClick={() => handleOpenSubmissionModal(post.post_id)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                                      style={{ backgroundColor: 'var(--color-primary-500)' }}>
                                Entregar Tarea
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Examen actions */}
                      {post.tipo === 'examen' && post.url_enlace && (
                        <div className="mt-4 p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)' }}>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-card)' }}>
                              <ClipboardCheck className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Examen Virtual</p>
                              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Haz clic para abrir el enlace</p>
                            </div>
                          </div>
                          <div>
                            <a href={post.url_enlace} target="_blank" rel="noreferrer"
                               className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 inline-block"
                               style={{ backgroundColor: 'var(--color-primary-500)' }}>
                              Ir al Examen
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comments section */}
                    <div style={{ borderTop: '1px solid var(--border-light)' }}>
                      {comments.length > 0 && (
                        <div className="px-4 py-2 space-y-2">
                          {comments.map(c => (
                            <div key={c.comentario_id} className="flex items-start gap-2 py-1.5">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5"
                                   style={{ backgroundColor: c.autor_rol === 'Jedi' ? 'var(--color-primary-600)' : '#6366f1' }}>
                                {c.autor_nombres?.charAt(0)}{c.autor_apellidos?.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs">
                                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.autor_nombres} {c.autor_apellidos}</span>
                                  <span className="ml-2" style={{ color: 'var(--text-muted)' }}>
                                    {new Date(c.fecha_creacion).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.contenido}</p>
                              </div>
                              {(c.autor_id === user?.usuario_id || isJedi) && (
                                <button onClick={() => handleDeleteComment(c.comentario_id)}
                                        className="p-0.5 hover:opacity-70 flex-shrink-0">
                                  <Trash2 className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment */}
                      <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: 'var(--surface-page)' }}>
                        <input value={commentText[post.post_id] || ''}
                               onChange={e => setCommentText(prev => ({ ...prev, [post.post_id]: e.target.value }))}
                               onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(post.post_id); } }}
                               placeholder="Escribe un comentario..."
                               className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                               style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
                        <button onClick={() => handleAddComment(post.post_id)}
                                disabled={!commentText[post.post_id]?.trim() || commentSubmitting === post.post_id}
                                className="p-1.5 rounded-lg disabled:opacity-30 transition-all"
                                style={{ backgroundColor: 'var(--color-primary-500)' }}>
                          <Send className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'estudiantes' && (
          <div className="max-w-3xl">
            {/* Jedi card */}
            <div className="rounded-2xl p-4 mb-4 flex items-center gap-4"
                 style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                   style={{ backgroundColor: 'var(--color-primary-600)' }}>
                {course.jedi_nombre?.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {course.jedi_nombre}
                  <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">Profesor</span>
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mentor Jedi del curso</p>
              </div>
            </div>

            {/* Students */}
            {students.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2" style={{ color: 'var(--text-muted)' }}>
                <Users className="w-8 h-8" />
                <p className="text-sm">Aun no hay estudiantes inscritos.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.map(s => (
                  <div key={s.usuario_id} className="rounded-xl p-3 flex items-center gap-3"
                       style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                         style={{ backgroundColor: '#6366f1' }}>
                      {s.nombres?.charAt(0)}{s.apellidos?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {s.nombres} {s.apellidos}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Inscrito el {new Date(s.fecha_inscripcion).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'calificaciones' && (
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {isJedi ? 'Calificaciones de Estudiantes' : 'Mis Calificaciones'}
              </h2>
              <div className="flex gap-2">
                {isJedi && (
                  <button onClick={() => setShowGradeModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: 'var(--color-primary-500)' }}>
                    <Plus className="w-4 h-4" /> Calificar Alumno
                  </button>
                )}
                <button onClick={handleExportGrades}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead style={{ backgroundColor: 'var(--surface-page)' }}>
                    <tr>
                      <th className="px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Alumno</th>
                      {posts.filter(p => p.tipo === 'tarea' || p.tipo === 'examen').reverse().map(post => (
                        <th key={post.post_id} className="px-4 py-3 font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>
                          {post.titulo || (post.tipo === 'tarea' ? 'Tarea' : 'Examen')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                    {(isJedi ? students : students.filter(s => s.usuario_id === user?.usuario_id)).length === 0 ? (
                      <tr>
                        <td colSpan={posts.filter(p => p.tipo === 'tarea' || p.tipo === 'examen').length + 1} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                          No hay estudiantes para calificar.
                        </td>
                      </tr>
                    ) : (
                      (isJedi ? students : students.filter(s => s.usuario_id === user?.usuario_id)).map(s => (
                        <tr key={s.usuario_id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                            {s.nombres} {s.apellidos}
                          </td>
                          {posts.filter(p => p.tipo === 'tarea' || p.tipo === 'examen').reverse().map(post => {
                            const postGrade = grades.find(g => g.padawan_id === s.usuario_id && (g.evaluacion === post.titulo || (!post.titulo && g.evaluacion.toLowerCase() === post.tipo)));
                            return (
                              <td key={post.post_id} className="px-4 py-3 text-center">
                                {postGrade ? (
                                  <span className="font-bold text-sm" style={{ color: 'var(--color-primary-500)' }}>
                                    {postGrade.nota} <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/ {postGrade.nota_maxima}</span>
                                  </span>
                                ) : (
                                  isJedi ? (
                                    <button onClick={() => {
                                      setGradeForm({ padawan_id: s.usuario_id, titulo: post.titulo || (post.tipo === 'tarea' ? 'Tarea' : 'Examen'), nota: 0, nota_maxima: 20, comentario: '', submissionId: '' });
                                      setShowGradeModal(true);
                                    }} className="text-[10px] px-2 py-1 bg-gray-500/10 hover:bg-gray-500/20 rounded font-semibold text-gray-500 transition-colors">
                                      Calificar
                                    </button>
                                  ) : (
                                    <span className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>Sin calificar</span>
                                  )
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Calificar Estudiante</h2>
              <button onClick={() => setShowGradeModal(false)} className="p-1 rounded-lg hover:opacity-70">
                <Trash2 className="w-5 h-5 opacity-0" /> {/* Spacer */}
                <span className="text-xl leading-none absolute top-5 right-5 cursor-pointer">×</span>
              </button>
            </div>
            <form onSubmit={handleCreateGrade} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Estudiante *</label>
                <select value={gradeForm.padawan_id} onChange={e => setGradeForm(f => ({ ...f, padawan_id: e.target.value }))} required
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
                  <option value="">Selecciona un estudiante...</option>
                  {students.map(s => (
                    <option key={s.usuario_id} value={s.usuario_id}>{s.nombres} {s.apellidos}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Evaluación *</label>
                <input value={gradeForm.titulo} onChange={e => setGradeForm(f => ({ ...f, titulo: e.target.value }))} required placeholder="Ej: Tarea 1, Examen Parcial"
                       className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nota *</label>
                  <input type="number" step="0.1" value={gradeForm.nota || ''} onChange={e => setGradeForm(f => ({ ...f, nota: parseFloat(e.target.value) }))} required
                         className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nota Máxima</label>
                  <input type="number" step="0.1" value={gradeForm.nota_maxima} onChange={e => setGradeForm(f => ({ ...f, nota_maxima: parseFloat(e.target.value) }))}
                         className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Comentario</label>
                <textarea value={gradeForm.comentario} onChange={e => setGradeForm(f => ({ ...f, comentario: e.target.value }))} rows={2} placeholder="Opcional..."
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowGradeModal(false)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>Cancelar</button>
                <button type="submit" disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--color-primary-500)' }}>
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submission Modal (Padawan) */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Entregar Tarea</h2>
              <button onClick={() => setShowSubmissionModal(false)} className="p-1 rounded-lg hover:opacity-70">
                <span className="text-xl leading-none cursor-pointer">×</span>
              </button>
            </div>
            <form onSubmit={handleSubmitAssignment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Archivo PDF *</label>
                <div className="relative">
                  <input type="file" accept="application/pdf" required
                         onChange={e => setSubmissionFile(e.target.files ? e.target.files[0] : null)}
                         className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20" 
                         style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Comentarios (Opcional)</label>
                <textarea value={submissionComment} onChange={e => setSubmissionComment(e.target.value)} rows={3} placeholder="Algún comentario sobre tu entrega..."
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowSubmissionModal(false)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>Cancelar</button>
                <button type="submit" disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--color-primary-500)' }}>
                  <Upload className="w-4 h-4" /> {submitting ? 'Subiendo...' : 'Subir Entrega'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions List Modal (Jedi) */}
      {showSubmissionsListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden animate-fade-in flex flex-col max-h-[85vh]" style={{ backgroundColor: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Entregas de la Tarea</h2>
              <button onClick={() => setShowSubmissionsListModal(false)} className="p-1 rounded-lg hover:opacity-70">
                <span className="text-xl leading-none cursor-pointer">×</span>
              </button>
            </div>
            
            <div className="overflow-y-auto p-5">
              {submissionsList.length === 0 ? (
                <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                  <File className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Aún no hay entregas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissionsList.map(sub => (
                    <div key={sub.entrega_id} className="p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                         style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{sub.nombres} {sub.apellidos}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500">Entregado</span>
                        </div>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                          {new Date(sub.fecha_entrega).toLocaleString()}
                        </p>
                        {sub.comentarios && (
                          <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>"{sub.comentarios}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <a href={`http://localhost:3001${sub.archivo_url}`} target="_blank" rel="noreferrer"
                           className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all">
                          <Download className="w-3.5 h-3.5" /> Descargar PDF
                        </a>
                        {isJedi && (
                          <button onClick={() => handleGradeFromSubmission(sub)}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                                  style={{ backgroundColor: 'var(--color-primary-500)' }}>
                            <ClipboardCheck className="w-3.5 h-3.5" /> Calificar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
