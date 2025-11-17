// src/screens/DocumentsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

interface Document {
  id: string;
  name: string;
  type: 'proposal' | 'contract' | 'art' | 'report' | 'plan' | 'other';
  projectId?: string;
  clientId?: string;
  uploadDate: string;
  filePath: string;
  fileSize: number; // in bytes
}

const DocumentsScreen = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Proposta Projeto Residencial',
      type: 'proposal',
      projectId: '1',
      uploadDate: '2024-11-15',
      filePath: '/storage/emulated/0/Download/proposta.pdf',
      fileSize: 2048576 // ~2MB
    },
    {
      id: '2',
      name: 'Contrato Lojas Comerciais',
      type: 'contract',
      clientId: '2',
      uploadDate: '2024-11-10',
      filePath: '/storage/emulated/0/Download/contrato.pdf',
      fileSize: 1024512 // ~1MB
    },
    {
      id: '3',
      name: 'ART Projeto Elétrico',
      type: 'art',
      projectId: '2',
      uploadDate: '2024-11-05',
      filePath: '/storage/emulated/0/Download/art.pdf',
      fileSize: 512256 // ~0.5MB
    }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    name: '',
    type: 'other' as Document['type'],
    projectId: '',
    clientId: ''
  });

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      
      // In a real app, you would upload the file to cloud storage
      // For now, we'll just add it to our local list
      const newDocument: Document = {
        id: Date.now().toString(),
        name: res[0].name,
        type: documentForm.type,
        projectId: documentForm.projectId || undefined,
        clientId: documentForm.clientId || undefined,
        uploadDate: new Date().toISOString().split('T')[0],
        filePath: res[0].uri,
        fileSize: res[0].size || 0
      };
      
      setDocuments([...documents, newDocument]);
      setShowModal(false);
      setDocumentForm({
        name: '',
        type: 'other',
        projectId: '',
        clientId: ''
      });
      
      Alert.alert('Sucesso', 'Documento adicionado com sucesso!');
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Erro', 'Falha ao selecionar o documento');
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentIcon = (type: Document['type']): string => {
    switch (type) {
      case 'proposal': return '📝';
      case 'contract': return '📋';
      case 'art': return '📄';
      case 'report': return '📊';
      case 'plan': return '蓝图'; // "Blueprint" in Chinese
      default: return '📁';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestão de Documentos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={documents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <Text style={styles.documentIcon}>{getDocumentIcon(item.type)}</Text>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{item.name}</Text>
                <Text style={styles.documentType}>
                  {item.type === 'proposal' ? 'Proposta' : 
                   item.type === 'contract' ? 'Contrato' : 
                   item.type === 'art' ? 'ART' : 
                   item.type === 'report' ? 'Relatório' : 
                   item.type === 'plan' ? 'Planta' : 'Outro'}
                </Text>
              </View>
            </View>
            
            <View style={styles.documentDetails}>
              <Text style={styles.documentDetail}>Tamanho: {formatFileSize(item.fileSize)}</Text>
              <Text style={styles.documentDetail}>Data: {item.uploadDate}</Text>
              {item.projectId && <Text style={styles.documentDetail}>Projeto: {item.projectId}</Text>}
              {item.clientId && <Text style={styles.documentDetail}>Cliente: {item.clientId}</Text>}
            </View>
            
            <View style={styles.documentActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Visualizar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.actionButtonText}>Compartilhar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => setDocuments(documents.filter(doc => doc.id !== item.id))}
              >
                <Text style={styles.actionButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
      {/* Document Upload Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Documento</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome do documento"
              value={documentForm.name}
              onChangeText={text => setDocumentForm({...documentForm, name: text})}
            />
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Tipo:</Text>
              <View style={styles.pickerWrapper}>
                {(['proposal', 'contract', 'art', 'report', 'plan', 'other'] as Document['type'][]).map((type) => (
                  <TouchableOpacity 
                    key={type}
                    style={[
                      styles.pickerOption, 
                      documentForm.type === type && styles.pickerOptionSelected
                    ]}
                    onPress={() => setDocumentForm({...documentForm, type})}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      documentForm.type === type && styles.pickerOptionTextSelected
                    ]}>
                      {type === 'proposal' ? 'Proposta' : 
                       type === 'contract' ? 'Contrato' : 
                       type === 'art' ? 'ART' : 
                       type === 'report' ? 'Relatório' : 
                       type === 'plan' ? 'Planta' : 'Outro'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="ID do Projeto (opcional)"
              value={documentForm.projectId}
              onChangeText={text => setDocumentForm({...documentForm, projectId: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ID do Cliente (opcional)"
              value={documentForm.clientId}
              onChangeText={text => setDocumentForm({...documentForm, clientId: text})}
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
                onPress={pickDocument}
              >
                <Text style={styles.actionButtonText}>Selecionar Arquivo</Text>
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
  documentCard: {
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
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  documentIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  documentType: {
    fontSize: 12,
    color: '#666',
  },
  documentDetails: {
    marginBottom: 15,
  },
  documentDetail: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  documentActions: {
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
    flexWrap: 'wrap',
  },
  pickerOption: {
    flex: 0.45,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    margin: 5,
    borderRadius: 5,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default DocumentsScreen;