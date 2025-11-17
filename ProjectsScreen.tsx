// src/screens/ProjectsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addProject, updateProject, deleteProject, addTask, moveTask } from '../store/projectsSlice';
import { Project, Task } from '../store/projectsSlice';

const ProjectsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, tasks } = useSelector((state: RootState) => state.projects);
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    clientId: '',
    budget: ''
  });
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    dueDate: ''
  });

  const openProjectModal = (project: Project | null = null) => {
    if (project) {
      setCurrentProject(project);
      setProjectForm({
        name: project.name,
        description: project.description,
        clientId: project.clientId,
        budget: project.budget.toString()
      });
    } else {
      setCurrentProject(null);
      setProjectForm({ name: '', description: '', clientId: '', budget: '' });
    }
    setShowProjectModal(true);
  };

  const saveProject = () => {
    const newProject: Project = {
      id: currentProject?.id || Date.now().toString(),
      name: projectForm.name,
      description: projectForm.description,
      clientId: projectForm.clientId,
      status: currentProject?.status || 'not-started',
      startDate: currentProject?.startDate || new Date().toISOString().split('T')[0],
      endDate: currentProject?.endDate || '',
      budget: parseFloat(projectForm.budget) || 0,
      tasks: currentProject?.tasks || [],
      attachments: currentProject?.attachments || []
    };

    if (currentProject) {
      dispatch(updateProject(newProject));
    } else {
      dispatch(addProject(newProject));
    }

    setShowProjectModal(false);
    setProjectForm({ name: '', description: '', clientId: '', budget: '' });
  };

  const openTaskModal = (projectId: string) => {
    setTaskForm({ title: '', description: '', projectId, dueDate: '' });
    setShowTaskModal(true);
  };

  const saveTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description,
      projectId: taskForm.projectId,
      status: 'todo',
      dueDate: taskForm.dueDate,
      assignedTo: 'Me' // In a real app, this would be dynamic
    };

    dispatch(addTask(newTask));
    setShowTaskModal(false);
    setTaskForm({ title: '', description: '', projectId: '', dueDate: '' });
  };

  const moveTaskToStatus = (taskId: string, newStatus: Task['status']) => {
    dispatch(moveTask({ taskId, newStatus }));
  };

  const getTasksForProject = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const renderTaskCard = (task: Task) => {
    return (
      <View style={styles.taskCard}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskDescription}>{task.description}</Text>
        <Text style={styles.taskDueDate}>Vence: {task.dueDate}</Text>
        <View style={styles.taskActions}>
          {task.status !== 'todo' && (
            <TouchableOpacity 
              onPress={() => moveTaskToStatus(task.id, 'todo')}
              style={[styles.taskButton, { backgroundColor: task.status === 'todo' ? '#0066CC' : '#E0E0E0' }]}
            >
              <Text style={styles.taskButtonText}>To Do</Text>
            </TouchableOpacity>
          )}
          {task.status !== 'doing' && (
            <TouchableOpacity 
              onPress={() => moveTaskToStatus(task.id, 'doing')}
              style={[styles.taskButton, { backgroundColor: task.status === 'doing' ? '#0066CC' : '#E0E0E0' }]}
            >
              <Text style={styles.taskButtonText}>Doing</Text>
            </TouchableOpacity>
          )}
          {task.status !== 'done' && (
            <TouchableOpacity 
              onPress={() => moveTaskToStatus(task.id, 'done')}
              style={[styles.taskButton, { backgroundColor: task.status === 'done' ? '#0066CC' : '#E0E0E0' }]}
            >
              <Text style={styles.taskButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderKanbanColumn = (status: Task['status'], tasks: Task[]) => {
    return (
      <View style={styles.kanbanColumn}>
        <Text style={styles.kanbanTitle}>
          {status === 'todo' ? 'To Do' : status === 'doing' ? 'Doing' : 'Done'}
        </Text>
        <View style={styles.kanbanTasks}>
          {tasks.map(task => renderTaskCard(task))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestão de Projetos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openProjectModal()}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <Text style={styles.projectName}>{item.name}</Text>
              <Text style={[
                styles.projectStatus,
                { 
                  color: item.status === 'completed' ? '#4CAF50' : 
                         item.status === 'in-progress' ? '#2196F3' : '#FF9800' 
                }
              ]}>
                {item.status === 'completed' ? 'Concluído' : 
                 item.status === 'in-progress' ? 'Em andamento' : 'Não iniciado'}
              </Text>
            </View>
            <Text style={styles.projectDescription}>{item.description}</Text>
            <Text style={styles.projectBudget}>Orçamento: R$ {item.budget.toLocaleString('pt-BR')}</Text>
            
            <View style={styles.kanbanContainer}>
              {renderKanbanColumn('todo', getTasksForProject(item.id).filter(t => t.status === 'todo'))}
              {renderKanbanColumn('doing', getTasksForProject(item.id).filter(t => t.status === 'doing'))}
              {renderKanbanColumn('done', getTasksForProject(item.id).filter(t => t.status === 'done'))}
            </View>
            
            <View style={styles.projectActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => openTaskModal(item.id)}
              >
                <Text style={styles.actionButtonText}>Adicionar Tarefa</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                onPress={() => openProjectModal(item)}
              >
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => dispatch(deleteProject(item.id))}
              >
                <Text style={styles.actionButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
      {/* Project Modal */}
      <Modal
        visible={showProjectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProjectModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentProject ? 'Editar Projeto' : 'Novo Projeto'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome do projeto"
              value={projectForm.name}
              onChangeText={text => setProjectForm({...projectForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={projectForm.description}
              onChangeText={text => setProjectForm({...projectForm, description: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ID do cliente"
              value={projectForm.clientId}
              onChangeText={text => setProjectForm({...projectForm, clientId: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Orçamento (R$)"
              value={projectForm.budget}
              onChangeText={text => setProjectForm({...projectForm, budget: text})}
              keyboardType="numeric"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => setShowProjectModal(false)}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={saveProject}
              >
                <Text style={styles.actionButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Task Modal */}
      <Modal
        visible={showTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaskModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Tarefa</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Título da tarefa"
              value={taskForm.title}
              onChangeText={text => setTaskForm({...taskForm, title: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={taskForm.description}
              onChangeText={text => setTaskForm({...taskForm, description: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Data de vencimento (YYYY-MM-DD)"
              value={taskForm.dueDate}
              onChangeText={text => setTaskForm({...taskForm, dueDate: text})}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => setShowTaskModal(false)}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={saveTask}
              >
                <Text style={styles.actionButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  projectCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  projectStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  projectBudget: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: '600',
    marginBottom: 15,
  },
  kanbanContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  kanbanColumn: {
    flex: 1,
    marginRight: 5,
  },
  kanbanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
    padding: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
  kanbanTasks: {
    minHeight: 100,
  },
  taskCard: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  taskDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  taskActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  taskButton: {
    flex: 1,
    padding: 5,
    marginHorizontal: 2,
    borderRadius: 3,
    alignItems: 'center',
  },
  taskButtonText: {
    fontSize: 10,
    color: '#fff',
  },
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0066CC',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default ProjectsScreen;