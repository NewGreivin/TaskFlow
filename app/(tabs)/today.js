import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { FAB, Icon, IconButton, Surface, Text } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useSQLiteContext } from '../../src/data/database';
import { getStats, getTasks, toTaskCard, updateTaskStatus } from '../../src/data/taskRepository';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { cancelTaskNotifications } from '../../src/data/notificationRepository';
import { toLocalDateKey, weekFrom, formatDateEs } from '../../src/data/date';
import TaskCard from '../../src/components/TaskCard';
import SectionHeader from '../../src/components/SectionHeader';

export default function Today() {
  const router = useRouter(), db = useSQLiteContext();
  const { palette, isDark } = useAppTheme();
  const [selected, setSelected] = useState(toLocalDateKey());
  const [tasks, setTasks] = useState([]);
  const [, setStats] = useState(null);
  const days = weekFrom();
  const load = useCallback(async () => { const [rows, s] = await Promise.all([getTasks(db,{date:selected}), getStats(db)]); setTasks(rows.map(toTaskCard)); setStats(s); }, [db, selected]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const pending = tasks.filter(t=>t.status==='Pendiente').length;
  const progress = tasks.filter(t=>t.status==='En progreso').length;
  const completed = tasks.filter(t=>t.status==='Completada').length;
  const toggle = async (task) => { const nextStatus=task.status==='Completada'?'Pendiente':'Completada'; await updateTaskStatus(db, task.id, nextStatus); if(nextStatus==='Completada') await cancelTaskNotifications(db, task.id); load(); };
  const label = formatDateEs(selected);
  return <View style={[styles.container,{backgroundColor:palette.background}]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><View style={{flex:1}}><Text variant="labelLarge" style={{color:palette.primary,fontWeight:'800'}}>{label.toUpperCase()}</Text><Text variant="headlineSmall" style={[styles.greeting,{color:palette.text}]}>Tu día, a tu ritmo 👋</Text><Text variant="bodyMedium" style={{color:palette.muted,marginTop:3}}>{pending} pendientes para este día</Text></View><View style={styles.headerActions}><IconButton icon={isDark?'white-balance-sunny':'weather-night'} mode="contained-tonal" onPress={()=>router.push('/appearance')}/><IconButton icon="bell-outline" mode="contained-tonal" onPress={()=>router.push('/notifications')}/></View></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>{days.map(d=><Pressable key={d.key} onPress={()=>setSelected(d.key)} style={[styles.day,{backgroundColor:palette.surface,borderColor:palette.border},selected===d.key&&{backgroundColor:palette.primary,borderColor:palette.primary}]}><Text style={{color:selected===d.key?'#FFF':palette.muted,fontSize:12,fontWeight:'700'}}>{d.day}</Text><Text variant="titleMedium" style={{color:selected===d.key?'#FFF':palette.text,marginTop:4,fontWeight:'800'}}>{d.date}</Text><View style={[styles.dayDot,{backgroundColor:selected===d.key?'#FFF':palette.primary}]}/></Pressable>)}</ScrollView>
      <View style={styles.metrics}><Metric value={pending} label="Pendientes" icon="clock-outline" color={palette.primary} palette={palette}/><Metric value={progress} label="En progreso" icon="progress-clock" color={palette.blue} palette={palette}/><Metric value={completed} label="Completadas" icon="check-circle-outline" color={palette.green} palette={palette}/></View>
      <SectionHeader title="Tareas del día" action="Ver todas ›" onAction={()=>router.push('/(tabs)/tasks')}/>
      {tasks.length ? tasks.map((task,i)=><TaskCard key={task.id} task={task} index={i} onToggle={()=>toggle(task)} onPress={()=>router.push(`/task/${task.id}`)}/>) : <Empty palette={palette}/>} 
      <Surface style={[styles.quote,{backgroundColor:palette.primarySoft}]} elevation={0}><View style={[styles.quoteIcon,{backgroundColor:palette.primary+'20'}]}><Icon source="leaf" size={20} color={palette.primary}/></View><View style={{flex:1}}><Text style={[styles.quoteTitle,{color:palette.text}]}>Un paso a la vez</Text><Text variant="bodySmall" style={{color:palette.muted}}>La constancia convierte las tareas en progreso.</Text></View></Surface>
    </ScrollView><FAB icon="plus" label="Nueva tarea" style={[styles.fab,{backgroundColor:palette.primary}]} color="#FFF" onPress={()=>router.push('/task/new')}/>
  </View>;
}
function Empty({palette}){return <View style={styles.empty}><View style={[styles.emptyIcon,{backgroundColor:palette.primarySoft}]}><Icon source="check-all" size={30} color={palette.primary}/></View><Text variant="titleMedium" style={{color:palette.text,fontWeight:'800'}}>Día despejado</Text><Text style={{color:palette.muted}}>No tienes tareas para esta fecha.</Text></View>}
function Metric({value,label,icon,color,palette}){return <Surface style={[styles.metric,{backgroundColor:palette.surface,borderColor:palette.border}]} elevation={0}><Icon source={icon} color={color} size={20}/><Text variant="titleLarge" style={[styles.metricValue,{color:palette.text}]}>{value}</Text><Text variant="labelSmall" style={{color:palette.muted,textAlign:'center'}}>{label}</Text></Surface>}
const styles=StyleSheet.create({container:{flex:1},content:{padding:20,paddingTop:55,paddingBottom:125},header:{flexDirection:'row',alignItems:'center',marginBottom:18},headerActions:{flexDirection:'row'},greeting:{fontWeight:'850',marginTop:3},days:{gap:8,paddingBottom:2},day:{width:55,paddingVertical:10,borderRadius:16,alignItems:'center',borderWidth:1},dayDot:{width:4,height:4,borderRadius:2,marginTop:5},metrics:{flexDirection:'row',gap:9,marginTop:18,marginBottom:25},metric:{flex:1,paddingVertical:13,borderRadius:17,alignItems:'center',borderWidth:1,gap:3},metricValue:{fontWeight:'850'},quote:{marginTop:5,padding:14,borderRadius:18,flexDirection:'row',alignItems:'center',gap:11},quoteIcon:{width:40,height:40,borderRadius:13,alignItems:'center',justifyContent:'center'},quoteTitle:{fontWeight:'800',marginBottom:2},empty:{alignItems:'center',paddingVertical:55,gap:7},emptyIcon:{width:68,height:68,borderRadius:22,alignItems:'center',justifyContent:'center',marginBottom:5},fab:{position:'absolute',right:18,bottom:88,borderRadius:18}});
