// src/screens/DashboardScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setProjects } from '../store/projectsSlice';
import { setClients } from '../store/clientsSlice';
import { setTransactions, setFinancialSummary } from '../store/financesSlice';
import { Project } from '../store/projectsSlice';
import { Client } from '../store/clientsSlice';
import { Transaction, FinancialSummary } from '../store/financesSlice';

const DashboardScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects } = useSelector((state: RootState) => state.projects);
  const { clients } = useSelector((state: RootState) => state.clients);
  const { transactions, summary } = useSelector((state: RootState) => state.finances);
  
  const [refreshing, setRefreshing] = React.useState(false);

  // Mock data initialization - in a real app, this would come from API
  useEffect(() => {
    // Initialize with mock data
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Construção Residencial',
        description: 'Projeto de casa térrea de 150m²',
        clientId: '1',
        status: 'in-progress',
        startDate: '2025-01-15',
        endDate: '2025-06-30',
        budget: 120000,
        tasks: [],
        attachments: []
      },
      {
        id: '2',
        name: 'Instalação Elétrica Comercial',
        description: 'Instalação elétrica em loja comercial',
        clientId: '2',
        status: 'not-started',
        startDate: '2025-02-01',
        endDate: '2025-04-15',
        budget: 45000,
        tasks: [],
        attachments: []
      }
    ];
    
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'João Silva',
        cpfCnpj: '123.456.789-00',
        email: 'joao@example.com',
        phone: '(11) 99999-9999',
        address: 'Rua A, 123 - São Paulo/SP',
        tags: ['residencial', 'confiável'],
        projectHistory: ['1'],
        paymentHistory: [
          { date: '2024-11-01', amount: 50000, status: 'paid' },
          { date: '2024-10-15', amount: 25000, status: 'paid' }
        ],
        nextFollowUp: null
      },
      {
        id: '2',
        name: 'Lojas Comerciais S/A',
        cpfCnpj: '12.345.678/0001-99',
        email: 'contato@lojascomerciais.com.br',
        phone: '(11) 3333-4444',
        address: 'Av. Paulista, 1000 - São Paulo/SP',
        tags: ['comercial', 'empresa'],
        projectHistory: ['2'],
        paymentHistory: [
          { date: '2024-11-10', amount: 30000, status: 'paid' }
        ],
        nextFollowUp: null
      }
    ];
    
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'income',
        amount: 50000,
        description: 'Pagamento projeto residencial',
        category: 'Consulting',
        clientId: '1',
        date: '2024-11-01',
        status: 'completed'
      },
      {
        id: '2',
        type: 'expense',
        amount: 15000,
        description: 'Compra de materiais',
        category: 'Materials',
        date: '2024-11-05',
        status: 'completed'
      }
    ];
    
    const mockSummary: FinancialSummary = {
      totalIncome: 50000,
      totalExpenses: 15000,
      netProfit: 35000,
      cashFlow: [
        { date: '2024-11-01', income: 50000, expenses: 0 },
        { date: '2024-11-05', income: 0, expenses: 15000 }
      ]
    };
    
    dispatch(setProjects(mockProjects));
    dispatch(setClients(mockClients));
    dispatch(setTransactions(mockTransactions));
    dispatch(setFinancialSummary(mockSummary));
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Calculate metrics
  const activeProjects = projects.filter(p => p.status !== 'completed').length;
  const overdueInvoices = transactions.filter(t => 
    t.type === 'income' && t.status === 'pending' && new Date(t.date) < new Date()
  ).length;
  const pendingTasks = 5; // Would come from actual calculation

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.greeting}>Olá, Engenheiro!</Text>
      </View>
      
      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{activeProjects}</Text>
          <Text style={styles.metricLabel}>Projetos Ativos</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>
            {summary ? `R$ ${summary.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
          </Text>
          <Text style={styles.metricLabel}>Lucro Líquido</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{pendingTasks}</Text>
          <Text style={styles.metricLabel}>Tarefas Pendentes</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{overdueInvoices}</Text>
          <Text style={styles.metricLabel}>Faturas Vencidas</Text>
        </View>
      </View>
      
      {/* Recent Projects */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projetos Recentes</Text>
        {projects.slice(0, 3).map(project => (
          <View key={project.id} style={styles.projectCard}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectStatus}>
              Status: <Text style={[
                styles.statusText, 
                { color: project.status === 'completed' ? '#4CAF50' : 
                         project.status === 'in-progress' ? '#2196F3' : '#FF9800' }
              ]}>
                {project.status === 'completed' ? 'Concluído' : 
                 project.status === 'in-progress' ? 'Em andamento' : 'Não iniciado'}
              </Text>
            </Text>
            <Text style={styles.projectBudget}>Orçamento: R$ {project.budget.toLocaleString('pt-BR')}</Text>
          </View>
        ))}
      </View>
      
      {/* Recent Clients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clientes Recentes</Text>
        {clients.slice(0, 3).map(client => (
          <View key={client.id} style={styles.clientCard}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientContact}>{client.email}</Text>
            <View style={styles.tagContainer}>
              {client.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricCard: {
    width: (windowWidth - 40) / 2 - 10,
    padding: 15,
    margin: 5,
    backgroundColor: '#E6F4FE',
    borderRadius: 8,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  projectCard: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  projectStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  statusText: {
    fontWeight: 'bold',
  },
  projectBudget: {
    fontSize: 14,
    color: '#0066CC',
    marginTop: 3,
  },
  clientCard: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clientContact: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
  },
});

export default DashboardScreen;