// src/screens/ClientsScreen.tsx
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
import { addClient, updateClient, deleteClient, addTagToClient, removeTagFromClient } from '../store/clientsSlice';
import { Client } from '../store/clientsSlice';

const ClientsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { clients } = useSelector((state: RootState) => state.clients);
  
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm] = useState({
    name: '',
    cpfCnpj: '',
    email: '',
    phone: '',
    address: '',
    tags: '' // As a comma-separated string
  });
  
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedClientForTag, setSelectedClientForTag] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const openModal = (client: Client | null = null) => {
    if (client) {
      setEditingClient(client);
      setClientForm({
        name: client.name,
        cpfCnpj: client.cpfCnpj,
        email: client.email,
        phone: client.phone,
        address: client.address,
        tags: client.tags.join(', ')
      });
    } else {
      setEditingClient(null);
      setClientForm({
        name: '',
        cpfCnpj: '',
        email: '',
        phone: '',
        address: '',
        tags: ''
      });
    }
    setShowModal(true);
  };

  const saveClient = () => {
    const tags = clientForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    const newClient: Client = {
      id: editingClient?.id || Date.now().toString(),
      name: clientForm.name,
      cpfCnpj: clientForm.cpfCnpj,
      email: clientForm.email,
      phone: clientForm.phone,
      address: clientForm.address,
      tags: tags,
      projectHistory: editingClient?.projectHistory || [],
      paymentHistory: editingClient?.paymentHistory || [],
      nextFollowUp: editingClient?.nextFollowUp || null
    };

    if (editingClient) {
      dispatch(updateClient(newClient));
    } else {
      dispatch(addClient(newClient));
    }

    setShowModal(false);
    setClientForm({
      name: '',
      cpfCnpj: '',
      email: '',
      phone: '',
      address: '',
      tags: ''
    });
  };

  const addTagToCurrentClient = () => {
    if (selectedClientForTag && newTag.trim() !== '') {
      dispatch(addTagToClient({ clientId: selectedClientForTag, tag: newTag.trim() }));
      setNewTag('');
      setShowTagModal(false);
      setSelectedClientForTag(null);
    }
  };

  const removeTag = (clientId: string, tag: string) => {
    dispatch(removeTagFromClient({ clientId, tag }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestão de Clientes (CRM)</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={clients}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.clientCard}>
            <View style={styles.clientHeader}>
              <Text style={styles.clientName}>{item.name}</Text>
            </View>
            <Text style={styles.clientDetail}>CPF/CNPJ: {item.cpfCnpj}</Text>
            <Text style={styles.clientDetail}>Email: {item.email}</Text>
            <Text style={styles.clientDetail}>Telefone: {item.phone}</Text>
            <Text style={styles.clientDetail}>Endereço: {item.address}</Text>
            
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsLabel}>Tags:</Text>
              <View style={styles.tagsList}>
                {item.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity 
                      onPress={() => removeTag(item.id, tag)}
                      style={styles.removeTagButton}
                    >
                      <Text style={styles.removeTagText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.clientActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setSelectedClientForTag(item.id);
                  setShowTagModal(true);
                }}
              >
                <Text style={styles.actionButtonText}>Adicionar Tag</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                onPress={() => openModal(item)}
              >
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => dispatch(deleteClient(item.id))}
              >
                <Text style={styles.actionButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
      {/* Client Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={clientForm.name}
              onChangeText={text => setClientForm({...clientForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="CPF/CNPJ"
              value={clientForm.cpfCnpj}
              onChangeText={text => setClientForm({...clientForm, cpfCnpj: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={clientForm.email}
              onChangeText={text => setClientForm({...clientForm, email: text})}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={clientForm.phone}
              onChangeText={text => setClientForm({...clientForm, phone: text})}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Endereço"
              value={clientForm.address}
              onChangeText={text => setClientForm({...clientForm, address: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Tags (separadas por vírgula)"
              value={clientForm.tags}
              onChangeText={text => setClientForm({...clientForm, tags: text})}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={saveClient}
              >
                <Text style={styles.actionButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Tag Modal */}
      <Modal
        visible={showTagModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTagModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Tag</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nova tag"
              value={newTag}
              onChangeText={setNewTag}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => setShowTagModal(false)}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={addTagToCurrentClient}
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
  clientCard: {
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
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clientDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  tagsContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
    marginRight: 3,
  },
  removeTagButton: {
    padding: 0,
  },
  removeTagText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: 'bold',
  },
  clientActions: {
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
});

export default ClientsScreen;