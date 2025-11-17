// src/screens/FinancesScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Picker
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addTransaction, updateTransaction, deleteTransaction, addCategory } from '../store/financesSlice';
import { Transaction } from '../store/financesSlice';

const FinancesScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, categories } = useSelector((state: RootState) => state.finances);
  
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionForm, setTransactionForm] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    projectId: '',
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed' as 'pending' | 'completed' | 'scheduled'
  });
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const openModal = (transaction: Transaction | null = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setTransactionForm({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        category: transaction.category,
        projectId: transaction.projectId || '',
        clientId: transaction.clientId || '',
        date: transaction.date.split('T')[0],
        status: transaction.status
      });
    } else {
      setEditingTransaction(null);
      setTransactionForm({
        type: 'income',
        amount: '',
        description: '',
        category: '',
        projectId: '',
        clientId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'completed'
      });
    }
    setShowModal(true);
  };

  const saveTransaction = () => {
    const newTransaction: Transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      type: transactionForm.type,
      amount: parseFloat(transactionForm.amount),
      description: transactionForm.description,
      category: transactionForm.category,
      projectId: transactionForm.projectId || undefined,
      clientId: transactionForm.clientId || undefined,
      date: transactionForm.date,
      status: transactionForm.status
    };

    if (editingTransaction) {
      dispatch(updateTransaction(newTransaction));
    } else {
      dispatch(addTransaction(newTransaction));
    }

    setShowModal(false);
    setTransactionForm({
      type: 'income',
      amount: '',
      description: '',
      category: '',
      projectId: '',
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    });
  };

  const addNewCategory = () => {
    if (newCategory.trim() !== '') {
      dispatch(addCategory(newCategory.trim()));
      setNewCategory('');
      setShowCategoryModal(false);
    }
  };

  // Calculate financial metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestão Financeira</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      {/* Financial Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Receitas</Text>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={[styles.summaryValue, { color: '#F44336' }]}>
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Lucro Líquido</Text>
          <Text style={[
            styles.summaryValue, 
            { color: netProfit >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
      
      {/* Transactions List */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Transações Recentes</Text>
        
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[
              styles.transactionCard,
              { 
                borderLeftColor: item.type === 'income' ? '#4CAF50' : '#F44336',
                borderLeftWidth: 4
              }
            ]}>
              <View style={styles.transactionHeader}>
                <Text style={[
                  styles.transactionType,
                  { 
                    color: item.type === 'income' ? '#4CAF50' : '#F44336',
                    fontWeight: 'bold'
                  }
                ]}>
                  {item.type === 'income' ? 'Receita' : 'Despesa'}
                </Text>
                <Text style={styles.transactionStatus}>
                  {item.status === 'completed' ? 'Concluído' : 
                   item.status === 'pending' ? 'Pendente' : 'Agendado'}
                </Text>
              </View>
              
              <Text style={styles.transactionDescription}>{item.description}</Text>
              <Text style={styles.transactionCategory}>Categoria: {item.category}</Text>
              <View style={styles.transactionFooter}>
                <Text style={styles.transactionAmount}>
                  R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.transactionDate}>{item.date}</Text>
              </View>
              
              <View style={styles.transactionActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                  onPress={() => openModal(item)}
                >
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                  onPress={() => dispatch(deleteTransaction(item.id))}
                >
                  <Text style={styles.actionButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
      
      {/* Transaction Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </Text>
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Tipo:</Text>
              <View style={styles.pickerWrapper}>
                <TouchableOpacity 
                  style={[
                    styles.pickerOption, 
                    transactionForm.type === 'income' && styles.pickerOptionSelected
                  ]}
                  onPress={() => setTransactionForm({...transactionForm, type: 'income'})}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    transactionForm.type === 'income' && styles.pickerOptionTextSelected
                  ]}>
                    Receita
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.pickerOption, 
                    transactionForm.type === 'expense' && styles.pickerOptionSelected
                  ]}
                  onPress={() => setTransactionForm({...transactionForm, type: 'expense'})}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    transactionForm.type === 'expense' && styles.pickerOptionTextSelected
                  ]}>
                    Despesa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Valor (R$)"
              value={transactionForm.amount}
              onChangeText={text => setTransactionForm({...transactionForm, amount: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={transactionForm.description}
              onChangeText={text => setTransactionForm({...transactionForm, description: text})}
            />
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Categoria:</Text>
              <View style={styles.categoryContainer}>
                <Picker
                  selectedValue={transactionForm.category}
                  onValueChange={value => setTransactionForm({...transactionForm, category: value})}
                  style={styles.picker}
                >
                  {categories.map((category, index) => (
                    <Picker.Item key={index} label={category} value={category} />
                  ))}
                </Picker>
                <TouchableOpacity 
                  style={styles.addCategoryButton}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text style={styles.addCategoryText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="ID do Projeto (opcional)"
              value={transactionForm.projectId}
              onChangeText={text => setTransactionForm({...transactionForm, projectId: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ID do Cliente (opcional)"
              value={transactionForm.clientId}
              onChangeText={text => setTransactionForm({...transactionForm, clientId: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Data (YYYY-MM-DD)"
              value={transactionForm.date}
              onChangeText={text => setTransactionForm({...transactionForm, date: text})}
            />
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Status:</Text>
              <Picker
                selectedValue={transactionForm.status}
                onValueChange={value => setTransactionForm({...transactionForm, status: value as any})}
                style={styles.picker}
              >
                <Picker.Item label="Concluído" value="completed" />
                <Picker.Item label="Pendente" value="pending" />
                <Picker.Item label="Agendado" value="scheduled" />
              </Picker>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={saveTransaction}
              >
                <Text style={styles.actionButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Categoria</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome da categoria"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={addNewCategory}
              >
                <Text style={styles.actionButtonText}>Adicionar</Text>
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
  summaryContainer: {
    flexDirection: 'row',
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
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  transactionsContainer: {
    flex: 1,
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
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  transactionCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionStatus: {
    fontSize: 12,
    color: '#666',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  pickerWrapper: {
    flexDirection: 'row',
  },
  pickerOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    borderRightWidth: 0,
  },
  pickerOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0066CC',
  },
  pickerOptionText: {
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    flex: 1,
  },
  addCategoryButton: {
    width: 40,
    height: 40,
    backgroundColor: '#0066CC',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addCategoryText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default FinancesScreen;