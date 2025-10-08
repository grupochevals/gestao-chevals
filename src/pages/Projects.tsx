import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, DollarSign, User, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { toast } from 'sonner';
import type { Projeto } from '@/stores/projectStore';

export function Projects() {
  const { projects, loading, fetchProjects, deleteProject } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.responsavel?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && project.status === activeTab;
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await deleteProject(id);
        toast.success('Projeto excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir projeto');
      }
    }
  };

  const handleEdit = (project: Projeto) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProject(null);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'planejamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'concluido':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planejamento':
        return 'Planejamento';
      case 'ativo':
        return 'Ativo';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const projectCounts = {
    all: projects.length,
    planejamento: projects.filter(p => p.status === 'planejamento').length,
    ativo: projects.filter(p => p.status === 'ativo').length,
    concluido: projects.filter(p => p.status === 'concluido').length,
    cancelado: projects.filter(p => p.status === 'cancelado').length,
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedProject(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedProject ? 'Editar Projeto' : 'Novo Projeto'}
              </DialogTitle>
            </DialogHeader>
            <ProjectForm 
              project={selectedProject} 
              onClose={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Projetos</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, descrição ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Todos ({projectCounts.all})
              </TabsTrigger>
              <TabsTrigger value="planejamento" className="flex items-center gap-2">
                Planejamento ({projectCounts.planejamento})
              </TabsTrigger>
              <TabsTrigger value="ativo" className="flex items-center gap-2">
                Ativos ({projectCounts.ativo})
              </TabsTrigger>
              <TabsTrigger value="concluido" className="flex items-center gap-2">
                Concluídos ({projectCounts.concluido})
              </TabsTrigger>
              <TabsTrigger value="cancelado" className="flex items-center gap-2">
                Cancelados ({projectCounts.cancelado})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{project.nome}</CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(project.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {project.descricao && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.descricao}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        {(project.data_inicio || project.data_fim) && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {formatDate(project.data_inicio)} - {formatDate(project.data_fim)}
                            </span>
                          </div>
                        )}
                        
                        {project.orcamento && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {formatCurrency(project.orcamento)}
                            </span>
                          </div>
                        )}
                        
                        {project.responsavel && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {project.responsavel}
                            </span>
                          </div>
                        )}
                      </div>

                      {project.observacoes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {project.observacoes}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-gray-400">
                          Criado em {formatDate(project.created_at)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ID: {project.id}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum projeto encontrado
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}