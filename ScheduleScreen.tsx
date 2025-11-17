// src/screens/ScheduleScreen.tsx
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
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Set locale to Portuguese
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
};
LocaleConfig.defaultLocale = 'pt-br';

interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  projectId?: string;
  clientId?: string;
  type: 'visit' | 'meeting' | 'deadline' | 'other';
  reminder: boolean;
}

const ScheduleScreen = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: '1',
      title: 'Visita Técnica',
      description: 'Visita técnica no projeto residencial',
      date: '2024-11-20',
      startTime: '09:00',
      endTime: '11:00',
      projectId: '1',
      type: 'visit',
      reminder: true
    },
    {
      id: '2',
      title: 'Reunião com Cliente',
      description: 'Reunião para aprovação do projeto elétrico',
      date: '2024-11-22',
      startTime: '14:00',
      endTime: '15:30',
      clientId: '2',
      type: 'meeting',
      reminder: true
    },
    {
      id: '3',
      title: 'Entrega de Projeto',
      description: 'Entrega da planta finalizada',
      date: '2024-11-25',
      startTime: '10:00',
      endTime: '10:30',
      projectId: '2',
      type: 'deadline',
      reminder: true
    }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    projectId: '',
    clientId: '',
    type: 'other' as ScheduleEvent['type'],
    reminder: true
  });
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const saveEvent = () => {
    if (!eventForm.title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }
    
    const newEvent: ScheduleEvent = {
      id: Date.now().toString(),
      title: eventForm.title,
      description: eventForm.description,
      date: eventForm.date,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      projectId: eventForm.projectId || undefined,
      clientId: eventForm.clientId || undefined,
      type: eventForm.type,
      reminder: eventForm.reminder
    };
    
    setEvents([...events, newEvent]);
    setShowModal(false);
    setEventForm({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '09:00',
      projectId: '',
      clientId: '',
      type: 'other',
      reminder: true
    });
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const getEventIcon = (type: ScheduleEvent['type']): string => {
    switch (type) {
      case 'visit': return '🏢';
      case 'meeting': return '👥';
      case 'deadline': return '⏰';
      default: return '📅';
    }
  };

  const getEventTypeColor = (type: ScheduleEvent['type']): string => {
    switch (type) {
      case 'visit': return '#2196F3';
      case 'meeting': return '#4CAF50';
      case 'deadline': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Mark dates with events in the calendar
  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = {
      selected: event.date === selectedDate,
      marked: true,
      dotColor: getEventTypeColor(event.type)
    };
    return acc;
  }, {} as any);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cronograma</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <Calendar
        style={styles.calendar}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={markedDates}
        markingType={'multi-dot'}
        locale={'pt-br'}
      />
      
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          Eventos para {selectedDate} ({getEventsForDate(selectedDate).length})
        </Text>
        
        <FlatList
          data={getEventsForDate(selectedDate)}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventIcon}>{getEventIcon(item.type)}</Text>
                <View style={styles.eventTime}>
                  <Text style={styles.eventTimeText}>{item.startTime} - {item.endTime}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    // For simplicity, we'll just open the modal with existing data
                    setEventForm({
                      title: item.title,
                      description: item.description,
                      date: item.date,
                      startTime: item.startTime,
                      endTime: item.endTime,
                      projectId: item.projectId || '',
                      clientId: item.clientId || '',
                      type: item.type,
                      reminder: item.reminder
                    });
                    setShowModal(true);
                  }}
                >
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
              
              <View style={styles.eventDetails}>
                {item.projectId && <Text style={styles.eventDetail}>Projeto: {item.projectId}</Text>}
                {item.clientId && <Text style={styles.eventDetail}>Cliente: {item.clientId}</Text>}
                <Text style={styles.eventDetail}>
                  Lembrete: {item.reminder ? 'Sim' : 'Não'}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => setEvents(events.filter(event => event.id !== item.id))}
              >
                <Text style={styles.actionButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum evento para esta data</Text>
            </View>
          }
        />
      </View>
      
      {/* Event Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Evento</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Título do evento"
              value={eventForm.title}
              onChangeText={text => setEventForm({...eventForm, title: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={eventForm.description}
              onChangeText={text => setEventForm({...eventForm, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Data (YYYY-MM-DD)"
              value={eventForm.date}
              onChangeText={text => setEventForm({...eventForm, date: text})}
            />
            
            <View style={styles.timeRow}>
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>Início:</Text>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  placeholder="HH:MM"
                  value={eventForm.startTime}
                  onChangeText={text => setEventForm({...eventForm, startTime: text})}
                />
              </View>
              
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>Término:</Text>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  placeholder="HH:MM"
                  value={eventForm.endTime}
                  onChangeText={text => setEventForm({...eventForm, endTime: text})}
                />
              </View>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="ID do Projeto (opcional)"
              value={eventForm.projectId}
              onChangeText={text => setEventForm({...eventForm, projectId: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ID do Cliente (opcional)"
              value={eventForm.clientId}
              onChangeText={text => setEventForm({...eventForm, clientId: text})}
            />
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Tipo:</Text>
              <View style={styles.pickerWrapper}>
                {(['visit', 'meeting', 'deadline', 'other'] as ScheduleEvent['type'][]).map((type) => (
                  <TouchableOpacity 
                    key={type}
                    style={[
                      styles.pickerOption, 
                      eventForm.type === type && styles.pickerOptionSelected
                    ]}
                    onPress={() => setEventForm({...eventForm, type})}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      eventForm.type === type && styles.pickerOptionTextSelected
                    ]}>
                      {type === 'visit' ? 'Visita Técnica' : 
                       type === 'meeting' ? 'Reunião' : 
                       type === 'deadline' ? 'Prazo' : 'Outro'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => setEventForm({...eventForm, reminder: !eventForm.reminder})}
              >
                <Text style={styles.checkboxText}>
                  {eventForm.reminder ? '✓' : ''}
                </Text>
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Enviar lembrete</Text>
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
                onPress={saveEvent}
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
  calendar: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventsContainer: {
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
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  eventTime: {
    flex: 1,
  },
  eventTimeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 3,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  eventDetails: {
    marginBottom: 10,
  },
  eventDetail: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  actionButton: {
    backgroundColor: '#0066CC',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  timeInput: {
    flex: 1,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default ScheduleScreen;