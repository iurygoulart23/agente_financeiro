// src/utils/dateFormatter.js
export const formatDate = (dateString, format = 'long') => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return dateString;
    
    // Opções para configuração do formato de data
    const options = {
      short: { day: '2-digit', month: '2-digit', year: 'numeric' },
      medium: { day: '2-digit', month: 'short', year: 'numeric' },
      long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      dateTime: { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      },
      relative: {} // especial - tratado com lógica personalizada
    };
    
    // Para formato relativo (hoje, ontem, etc.)
    if (format === 'relative') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const dateToCompare = new Date(date);
      dateToCompare.setHours(0, 0, 0, 0);
      
      // Calcular diferença em dias
      const diffTime = dateToCompare.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateToCompare.getTime() === today.getTime()) {
        return 'Hoje';
      } else if (dateToCompare.getTime() === yesterday.getTime()) {
        return 'Ontem';
      } else if (diffDays > -7 && diffDays < 0) {
        // Dentro da última semana
        return `${Math.abs(diffDays)} dias atrás`;
      } else if (diffDays > 0 && diffDays < 7) {
        // Próximos 7 dias
        return `Em ${diffDays} dias`;
      } else {
        // Qualquer outra data usa o formato medium
        return date.toLocaleDateString('pt-BR', options.medium);
      }
    }
    
    // Para outros formatos, usa o Intl.DateTimeFormat
    const selectedFormat = options[format] || options.medium;
    return new Intl.DateTimeFormat('pt-BR', selectedFormat).format(date);
  };
  
  export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Retorna o primeiro e último dia do mês
  export const getMonthRange = (date = new Date()) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  };
  
  // Retorna o período formatado
  export const formatPeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Mesmo dia
    if (start.getTime() === end.getTime()) {
      return formatDate(startDate, 'medium');
    }
    
    // Mesmo mês e ano
    if (
      start.getMonth() === end.getMonth() && 
      start.getFullYear() === end.getFullYear()
    ) {
      // Verificar se é o mês inteiro
      const isEntireMonth = 
        start.getDate() === 1 && 
        end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
      
      if (isEntireMonth) {
        // Formato para mês completo: "Abril de 2025"
        return start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      }
    }
    
    // Mesmo ano
    if (start.getFullYear() === end.getFullYear()) {
      // Ano inteiro
      const isEntireYear = 
        start.getMonth() === 0 && start.getDate() === 1 &&
        end.getMonth() === 11 && end.getDate() === 31;
      
      if (isEntireYear) {
        return start.getFullYear().toString();
      }
      
      // Período dentro do mesmo ano
      return `${formatDate(startDate, 'short')} a ${formatDate(endDate, 'short')}`;
    }
    
    // Períodos que cruzam anos
    return `${formatDate(startDate, 'short')} a ${formatDate(endDate, 'short')}`;
  };