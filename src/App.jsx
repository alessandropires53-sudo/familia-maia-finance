import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, CreditCard, DollarSign, Calendar, 
  Lock, PieChart, Shield, LogOut, Camera, Plus, Trash2, Edit3, CheckCircle, AlertCircle, X, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Layers, ChevronLeft, ChevronRight, FileText, Bell, Target, Sparkles, Percent, CheckSquare, Square, Download
} from 'lucide-react';

export default function App() {
  // --- CONTROLE DO POP-UP PWA DE INSTALAÇÃO ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detecta se é iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Captura evento de instalação nativa no Android/Chrome
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // No iOS, se não estiver rodando como app standalone, mostra dica de instalação
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isIosDevice && !isStandalone) {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setShowInstallBanner(false);
        }
        setDeferredPrompt(null);
      });
    }
  };

  // --- CAPTURA DA DATA EM TEMPO REAL ---
  const [currentDate, setCurrentDate] = useState(new Date());

  const getFormattedFullDate = (date) => {
    const day = date.getDate();
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const year = date.getFullYear();
    return `${day} de ${capitalizedMonth} de ${year}`;
  };

  const getFormattedMonthYear = (date) => {
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const year = date.getFullYear();
    return `${capitalizedMonth} de ${year}`;
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, currentDate.getDate());
    setCurrentDate(newDate);
  };

  const currentMonthYear = getFormattedMonthYear(currentDate);
  const currentFullDateStr = getFormattedFullDate(currentDate);
  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  // --- ESTADOS DE AUTENTICAÇÃO COM PERSISTÊNCIA CORRETA ---
  const [selectedMember, setSelectedMember] = useState(() => {
    return localStorage.getItem('maia_logged_member') || null;
  });
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('maia_auth') === 'true';
  });
  const [hideValues, setHideValues] = useState(false);
  const [activeTab, setActiveTab] = useState('renda');

  // Fotos de perfil persistidas
  const [userPhotos, setUserPhotos] = useState(() => {
    const saved = localStorage.getItem('maia_user_photos');
    return saved ? JSON.parse(saved) : { alessandro: null, giovanna: null };
  });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // PIN Caixinhas
  const [pinInput, setPinInput] = useState('');
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Modal Caixinha
  const [activeCaixinhaModal, setActiveCaixinhaModal] = useState(null);
  const [caixinhaValorInput, setCaixinhaValorInput] = useState('');
  const [showNovaCaixinhaModal, setShowNovaCaixinhaModal] = useState(false);
  const [caixinhaForm, setCaixinhaForm] = useState({ 
    id: null, nome: '', meta: '', atual: '', tipoInvest: 'CDB 100% CDI (Liquidez Diária)', icone: '🛡️', cor: 'from-emerald-500 to-teal-600' 
  });

  // --- ESTADOS FINANCEIROS COM PERSISTÊNCIA LOCALSTORAGE ---
  const [rendasFixas, setRendasFixas] = useState(() => {
    const saved = localStorage.getItem('maia_rendas_fixas');
    return saved ? JSON.parse(saved) : [
      { id: 'alessandro', label: 'Alessandro (Wlinks)', sub: 'Salário Fixo', valor: 1180 },
      { id: 'giovanna', label: 'Giovanna', sub: 'Salário Fixo', valor: 1650 },
      { id: 'academia', label: 'Academia', sub: 'Faxina Aos Sábados', valor: 840 }
    ];
  });

  const [rendasVariaveis, setRendasVariaveis] = useState(() => {
    const saved = localStorage.getItem('maia_rendas_variaveis');
    return saved ? JSON.parse(saved) : [
      { id: 'esposa', label: 'Renda Extra (Esposa)', sub: 'Trabalhos adicionais', valor: 490 },
      { id: 'premiacao', label: 'Premiação / Meta Trabalho', sub: 'Estimado (Pode variar)', valor: 300 },
      { id: 'motoboy', label: 'Entrega Motoboy', sub: 'Extra / Variável', valor: 350 }
    ];
  });

  const [topicosExtras, setTopicosExtras] = useState(() => {
    const saved = localStorage.getItem('maia_topicos_extras');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNovoTopicoModal, setShowNovoTopicoModal] = useState(false);
  const [novoTopicoNome, setNovoTopicoNome] = useState('');
  const [showNovaRendaModal, setShowNovaRendaModal] = useState(false);
  const [novaRendaForm, setNovaRendaForm] = useState({ topicoTarget: 'variavel', label: '', sub: '', valor: '' });

  const [despesasFixas, setDespesasFixas] = useState(() => {
    const saved = localStorage.getItem('maia_despesas_fixas');
    return saved ? JSON.parse(saved) : [
      { id: 1, nome: 'Internet Fibra (Sua parte)', categoria: 'Serviços', valor: 75 },
      { id: 2, nome: 'Plano Celular Casal', categoria: 'Comunicação', valor: 100 },
      { id: 3, nome: 'Gasolina Moto', categoria: 'Transporte', valor: 50 },
      { id: 4, nome: 'Cuidado das Crianças (Pai)', categoria: 'Família', valor: 150 }
    ];
  });
  const [showFixaModal, setShowFixaModal] = useState(false);
  const [novaFixa, setNovaFixa] = useState({ nome: '', categoria: 'Geral', valor: '' });

  const [parcelas, setParcelas] = useState(() => {
    const saved = localStorage.getItem('maia_parcelas');
    return saved ? JSON.parse(saved) : [
      { id: 1, nome: 'Cartão da Tia (Fatura Principal)', tag: 'Cartão Principal', valor: 2052.00, parcelaAtual: 1, totalParcelas: 99, diaVencimento: 10, mesInicio: 9, anoInicio: 2026 },
      { id: 2, nome: 'Cartão Tia 2 (Novo Parcelamento)', tag: 'Acerto', valor: 195.00, parcelaAtual: 1, totalParcelas: 10, diaVencimento: 10, mesInicio: 10, anoInicio: 2026 },
      { id: 3, nome: 'Caixinha Acerto Tia', tag: 'Acerto Único', valor: 625.00, parcelaAtual: 1, totalParcelas: 1, diaVencimento: 15, mesInicio: 10, anoInicio: 2026 },
      { id: 4, nome: 'Dívida Primo #1', tag: 'Empréstimo', valor: 121.00, parcelaAtual: 9, totalParcelas: 10, diaVencimento: 5, mesInicio: 10, anoInicio: 2026 },
      { id: 5, nome: 'Dívida Primo #2', tag: 'Empréstimo', valor: 211.00, parcelaAtual: 6, totalParcelas: 10, diaVencimento: 5, mesInicio: 10, anoInicio: 2026 },
      { id: 6, nome: 'Dívida Primo #3', tag: 'Empréstimo', valor: 107.00, parcelaAtual: 4, totalParcelas: 6, diaVencimento: 5, mesInicio: 10, anoInicio: 2026 },
      { id: 7, nome: 'Perfume Casal', tag: 'Compras', valor: 100.00, parcelaAtual: 3, totalParcelas: 4, diaVencimento: 15, mesInicio: 10, anoInicio: 2026 }
    ];
  });
  const [showParcelaModal, setShowParcelaModal] = useState(false);
  const [novaParcela, setNovaParcela] = useState({ nome: '', tag: 'Geral', valor: '', parcelaAtual: 1, totalParcelas: 1, diaVencimento: 10 });

  const [caixinhas, setCaixinhas] = useState(() => {
    const saved = localStorage.getItem('maia_caixinhas');
    return saved ? JSON.parse(saved) : [
      { id: 1, nome: 'Reserva de Emergência', meta: 1000, atual: 0, tipoInvest: 'CDB 100% CDI (Liquidez Diária)', icone: '🛡️', cor: 'from-emerald-500 to-teal-600' },
      { id: 2, nome: 'Festa de 1 Aninho', meta: 4000, atual: 0, tipoInvest: 'Rendimento Fixo Diário', icone: '🎂', cor: 'from-pink-500 to-rose-600' },
      { id: 3, nome: 'Casamento & Viagem', meta: 45000, atual: 0, tipoInvest: 'Tesouro Selic (Pós-fixado)', icone: '💍', cor: 'from-amber-500 to-orange-600' },
      { id: 4, nome: 'Obra da Casa (Laje e Muro)', meta: 75000, atual: 0, tipoInvest: 'IPCA+ (Proteção Inflação)', icone: '🏗️', cor: 'from-sky-500 to-indigo-600' }
    ];
  });

  // --- CONTROLE DE PAGOS NO MÊS (CHECKBOX) ---
  const [pagosMesMap, setPagosMesMap] = useState(() => {
    const saved = localStorage.getItem('maia_pagos_mes');
    return saved ? JSON.parse(saved) : {};
  });

  const togglePago = (tipo, id) => {
    const key = `${currentMonthKey}_${tipo}_${id}`;
    setPagosMesMap(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('maia_pagos_mes', JSON.stringify(updated));
      return updated;
    });
  };

  const isPago = (tipo, id) => {
    const key = `${currentMonthKey}_${tipo}_${id}`;
    return !!pagosMesMap[key];
  };

  // --- SALVAR AUTOMATICAMENTE NO LOCALSTORAGE ---
  useEffect(() => { localStorage.setItem('maia_auth', isAuthenticated); }, [isAuthenticated]);
  useEffect(() => { localStorage.setItem('maia_user_photos', JSON.stringify(userPhotos)); }, [userPhotos]);
  useEffect(() => { localStorage.setItem('maia_rendas_fixas', JSON.stringify(rendasFixas)); }, [rendasFixas]);
  useEffect(() => { localStorage.setItem('maia_rendas_variaveis', JSON.stringify(rendasVariaveis)); }, [rendasVariaveis]);
  useEffect(() => { localStorage.setItem('maia_topicos_extras', JSON.stringify(topicosExtras)); }, [topicosExtras]);
  useEffect(() => { localStorage.setItem('maia_despesas_fixas', JSON.stringify(despesasFixas)); }, [despesasFixas]);
  useEffect(() => { localStorage.setItem('maia_parcelas', JSON.stringify(parcelas)); }, [parcelas]);
  useEffect(() => { localStorage.setItem('maia_caixinhas', JSON.stringify(caixinhas)); }, [caixinhas]);

  const updateRendaValue = (list, setList, id, value) => {
    setList(list.map(item => item.id === id ? { ...item, valor: Number(value) || 0 } : item));
  };

  // --- CÁLCULO DAS PARCELAS ATIVAS NO MÊS SELECIONADO ---
  const getParcelasDoMesVisualizado = (targetDate) => {
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    return parcelas.map(p => {
      const diffMeses = (targetYear - p.anoInicio) * 12 + (targetMonth - p.mesInicio);
      const numeroParcelaNoMes = p.parcelaAtual + diffMeses;
      const estaAtiva = numeroParcelaNoMes >= 1 && numeroParcelaNoMes <= p.totalParcelas;

      return {
        ...p,
        parcelaExibida: `${numeroParcelaNoMes}/${p.totalParcelas}`,
        estaAtiva
      };
    }).filter(p => p.estaAtiva);
  };

  const parcelasAtivasNoMes = getParcelasDoMesVisualizado(currentDate);

  // --- ALERTA DE VENCIMENTO EM DESTAQUE ---
  const hoje = new Date();
  const eMesAtualEmTempoReal = currentDate.getMonth() === hoje.getMonth() && currentDate.getFullYear() === hoje.getFullYear();

  const contasProximasDoVencimento = parcelasAtivasNoMes.filter(item => {
    if (!eMesAtualEmTempoReal || isPago('parcela', item.id)) return false;
    const diff = item.diaVencimento - hoje.getDate();
    return diff >= 0 && diff <= 3;
  });

  // --- CÁLCULOS EXCLUSIVOS DAS CAIXINHAS ---
  const totalMetaCaixinhas = caixinhas.reduce((acc, box) => acc + Number(box.meta), 0);
  const totalAcumuladoCaixinhas = caixinhas.reduce((acc, box) => acc + Number(box.atual), 0);
  const totalFaltanteCaixinhas = Math.max(0, totalMetaCaixinhas - totalAcumuladoCaixinhas);
  const percentualGlobalCaixinhas = totalMetaCaixinhas > 0 ? Math.min(100, Math.round((totalAcumuladoCaixinhas / totalMetaCaixinhas) * 100)) : 0;

  // --- CÁLCULOS TOTAIS GERAIS ---
  const subtotalFixasRenda = rendasFixas.reduce((acc, i) => acc + Number(i.valor), 0);
  const subtotalVariaveisRenda = rendasVariaveis.reduce((acc, i) => acc + Number(i.valor), 0);
  const subtotalTopicosExtras = topicosExtras.reduce((acc, topico) => {
    return acc + topico.itens.reduce((sub, item) => sub + Number(item.valor), 0);
  }, 0);

  const totalEntradas = subtotalFixasRenda + subtotalVariaveisRenda + subtotalTopicosExtras;
  const totalFixas = despesasFixas.reduce((acc, item) => acc + Number(item.valor), 0);
  const totalParcelasDoMes = parcelasAtivasNoMes.reduce((acc, item) => acc + Number(item.valor), 0);
  const totalDespesas = totalFixas + totalParcelasDoMes;
  const saldoProjetado = totalEntradas - totalDespesas;

  const formatMoney = (val) => {
    if (hideValues) return 'R$ •••••';
    return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // --- GERADOR DE PDF FORMAL DE RELATÓRIO ---
  const handleGerarPDFRelatorio = () => {
    const printWindow = window.open('', '_blank');
    const conteudoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatorio Financeiro - Família Maia</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; padding: 40px; margin: 0; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 15px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
          .header p { margin: 5px 0 0; color: #666; font-size: 12px; }
          .summary-grid { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 30px; }
          .summary-card { flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; background: #f9f9f9; }
          .summary-card span { font-size: 10px; text-transform: uppercase; color: #555; font-weight: bold; }
          .summary-card h2 { margin: 5px 0 0; font-size: 18px; color: #111; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
          th, td { border: 1px solid #eee; padding: 10px; text-align: left; }
          th { background: #f2f2f2; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          .section-title { font-size: 14px; font-weight: bold; border-left: 4px solid #222; padding-left: 8px; margin: 20px 0 10px; text-transform: uppercase; }
          .footer { text-align: center; border-top: 1px solid #ddd; pt: 15px; font-size: 10px; color: #888; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Saúde Financeira</h1>
          <p>Família Maia Finance • Competência: ${currentMonthYear} • Emitido em: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <span>Renda Bruta Total</span>
            <h2 style="color: #059669;">${formatMoney(totalEntradas)}</h2>
          </div>
          <div class="summary-card">
            <span>Total Comprometido</span>
            <h2 style="color: #e11d48;">${formatMoney(totalDespesas)}</h2>
          </div>
          <div class="summary-card">
            <span>Saldo Projetado</span>
            <h2>${formatMoney(saldoProjetado)}</h2>
          </div>
          <div class="summary-card">
            <span>Taxa de Uso</span>
            <h2>${((totalDespesas / totalEntradas) * 100 || 0).toFixed(1)}%</h2>
          </div>
        </div>

        <div class="section-title">1. Discriminação das Entradas</div>
        <table>
          <thead>
            <tr><th>Descrição</th><th>Categoria</th><th>Valor Proposto</th></tr>
          </thead>
          <tbody>
            ${rendasFixas.map(r => `<tr><td>${r.label} - ${r.sub}</td><td>Garantida</td><td>${formatMoney(r.valor)}</td></tr>`).join('')}
            ${rendasVariaveis.map(r => `<tr><td>${r.label} - ${r.sub}</td><td>Extra/Variável</td><td>${formatMoney(r.valor)}</td></tr>`).join('')}
          </tbody>
        </table>

        <div class="section-title">2. Parcelas & Amortizações do Mês (${currentMonthYear})</div>
        <table>
          <thead>
            <tr><th>Nome do Compromisso</th><th>Tag/Tipo</th><th>Parcela Vigente</th><th>Valor (R$)</th></tr>
          </thead>
          <tbody>
            ${parcelasAtivasNoMes.map(p => `<tr><td>${p.nome}</td><td>${p.tag}</td><td>${p.parcelaExibida}</td><td>${formatMoney(p.valor)}</td></tr>`).join('')}
          </tbody>
        </table>

        <div class="section-title">3. Posição Atual do Cofre / Caixinhas</div>
        <table>
          <thead>
            <tr><th>Caixinha</th><th>Estratégia de Rendimento</th><th>Acumulado</th><th>Meta Global</th></tr>
          </thead>
          <tbody>
            ${caixinhas.map(c => `<tr><td>${c.nome}</td><td>${c.tipoInvest}</td><td>${formatMoney(c.atual)}</td><td>${formatMoney(c.meta)}</td></tr>`).join('')}
          </tbody>
        </table>

        <div class="footer">
          Documento gerado automaticamente pelo sistema Família Maia Finance.
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(conteudoHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  // Auth Handlers
  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setLoginPass('');
    setLoginError('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    if (!selectedMember) {
      setLoginError('Selecione um membro para acessar.');
      return;
    }
    if (selectedMember === 'alessandro' && loginPass === '23510360') {
      setIsAuthenticated(true);
      localStorage.setItem('maia_auth', 'true');
      localStorage.setItem('maia_logged_member', 'alessandro');
    } else if (selectedMember === 'giovanna' && loginPass === 'Gio2351') {
      setIsAuthenticated(true);
      localStorage.setItem('maia_auth', 'true');
      localStorage.setItem('maia_logged_member', 'giovanna');
    } else {
      setLoginError('Senha incorreta!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedMember(null);
    setLoginPass('');
    setLoginError('');
    localStorage.removeItem('maia_auth');
    localStorage.removeItem('maia_logged_member');
  };

  const handlePhotoUpload = (e, userKey) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserPhotos(prev => ({ ...prev, [userKey]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (activeTab !== 'caixinhas') {
      setIsPinUnlocked(false);
      setPinInput('');
      setPinError(false);
    }
  }, [activeTab]);

  const handleUnlockPin = (e) => {
    e.preventDefault();
    if (pinInput === '2351') {
      setIsPinUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleMovimentarCaixinha = (valInput) => {
    if (!activeCaixinhaModal || !valInput) return;
    const val = Number(valInput);
    setCaixinhas(caixinhas.map(box => {
      if (box.id === activeCaixinhaModal.id) {
        let novoAtual = activeCaixinhaModal.tipo === 'guardar' ? box.atual + val : box.atual - val;
        return { ...box, atual: Math.max(0, novoAtual) };
      }
      return box;
    }));
    setActiveCaixinhaModal(null);
    setCaixinhaValorInput('');
  };

  const handleSalvarCaixinha = () => {
    if (!caixinhaForm.nome || !caixinhaForm.meta) return;

    if (caixinhaForm.id) {
      setCaixinhas(caixinhas.map(box => box.id === caixinhaForm.id ? { 
        ...box, 
        nome: caixinhaForm.nome, 
        meta: Number(caixinhaForm.meta), 
        atual: Number(caixinhaForm.atual) || box.atual,
        tipoInvest: caixinhaForm.tipoInvest,
        icone: caixinhaForm.icone,
        cor: caixinhaForm.cor
      } : box));
    } else {
      setCaixinhas([...caixinhas, {
        id: Date.now(),
        nome: caixinhaForm.nome,
        meta: Number(caixinhaForm.meta),
        atual: Number(caixinhaForm.atual) || 0,
        tipoInvest: caixinhaForm.tipoInvest,
        icone: caixinhaForm.icone || '🎯',
        cor: caixinhaForm.cor || 'from-emerald-500 to-teal-600'
      }]);
    }

    setShowNovaCaixinhaModal(false);
    setCaixinhaForm({ id: null, nome: '', meta: '', atual: '', tipoInvest: 'CDB 100% CDI (Liquidez Diária)', icone: '🛡️', cor: 'from-emerald-500 to-teal-600' });
  };

  const handleCriarTopico = () => {
    if (novoTopicoNome.trim()) {
      setTopicosExtras([...topicosExtras, { id: Date.now(), titulo: novoTopicoNome, itens: [] }]);
      setNovoTopicoNome('');
      setShowNovoTopicoModal(false);
    }
  };

  const handleAdicionarItemRenda = () => {
    if (!novaRendaForm.label || !novaRendaForm.valor) return;
    const newItem = {
      id: Date.now(),
      label: novaRendaForm.label,
      sub: novaRendaForm.sub || 'Lançamento Adicional',
      valor: Number(novaRendaForm.valor)
    };

    if (novaRendaForm.topicoTarget === 'variavel') {
      setRendasVariaveis([...rendasVariaveis, newItem]);
    } else {
      setTopicosExtras(topicosExtras.map(topico => {
        if (topico.id === Number(novaRendaForm.topicoTarget)) {
          return { ...topico, itens: [...topico.itens, newItem] };
        }
        return topico;
      }));
    }

    setShowNovaRendaModal(false);
    setNovaRendaForm({ topicoTarget: 'variavel', label: '', sub: '', valor: '' });
  };

  // --- TELA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-neutral-900 to-zinc-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-zinc-800/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full border border-zinc-700/80">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-zinc-100 to-zinc-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-zinc-950">
              <Wallet className="w-8 h-8 text-zinc-900" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Família Maia Finance</h1>
            <p className="text-xs font-semibold text-zinc-400 mt-1">Gestão Financeira • {currentFullDateStr}</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-3">
                SELECIONE O PERFIL
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectMember('alessandro')}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                    selectedMember === 'alessandro'
                      ? 'border-zinc-300 bg-zinc-700/60 text-white shadow-md ring-2 ring-zinc-400/30'
                      : 'border-zinc-700/80 hover:border-zinc-600 text-zinc-300 bg-zinc-900/80'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-900 font-black flex items-center justify-center text-sm shadow-sm overflow-hidden flex-shrink-0">
                    {userPhotos.alessandro ? <img src={userPhotos.alessandro} alt="A" className="w-full h-full object-cover" /> : 'AP'}
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-bold text-sm text-white truncate">Alessandro</div>
                    <div className="text-[10px] text-zinc-400">Membro</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMember('giovanna')}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                    selectedMember === 'giovanna'
                      ? 'border-zinc-300 bg-zinc-700/60 text-white shadow-md ring-2 ring-zinc-400/30'
                      : 'border-zinc-700/80 hover:border-zinc-600 text-zinc-300 bg-zinc-900/80'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-pink-600 text-white font-black flex items-center justify-center text-sm shadow-sm overflow-hidden flex-shrink-0">
                    {userPhotos.giovanna ? <img src={userPhotos.giovanna} alt="G" className="w-full h-full object-cover" /> : 'G'}
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-bold text-sm text-white truncate">Giovanna</div>
                    <div className="text-[10px] text-zinc-400">Membro</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                SENHA PRIVADA
              </label>
              <input
                type="password"
                placeholder={selectedMember ? "Digite sua senha" : "Selecione o perfil primeiro"}
                disabled={!selectedMember}
                value={loginPass}
                onChange={(e) => { setLoginPass(e.target.value); setLoginError(''); }}
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm transition-all ${
                  !selectedMember 
                    ? 'bg-zinc-950/50 border-zinc-800 text-zinc-600 cursor-not-allowed' 
                    : 'bg-zinc-950 border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-zinc-400'
                }`}
              />
              {loginError && <p className="text-xs text-rose-400 font-semibold mt-2">{loginError}</p>}
            </div>

            <button
              type="submit"
              disabled={!selectedMember || !loginPass}
              className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-900 font-black rounded-2xl shadow-lg shadow-zinc-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Entrar no App
            </button>
          </form>

          <div className="text-center mt-6 text-[11px] text-zinc-500 font-medium">
            Sistema Privado Família Maia
          </div>
        </div>
      </div>
    );
  }

  // --- APP PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-neutral-900 to-zinc-950 text-white font-sans pb-32">
      
      {/* BANNER INSTALAÇÃO PWA DESTAQUE */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 border-b border-emerald-500/50 flex items-center justify-between shadow-xl sticky top-0 z-50 animate-bounce">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs font-bold leading-tight">
              {isIOS ? (
                <span>Instale o App: toque em <strong>Compartilhar</strong> e selecione <strong>Adicionar à Tela de Início</strong></span>
              ) : (
                <span>Instale o Família Maia Finance na sua Tela Inicial!</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isIOS && deferredPrompt && (
              <button onClick={handleInstallPWA} className="px-3 py-1 bg-white text-zinc-900 font-black rounded-lg text-xs shadow-md">
                Instalar
              </button>
            )}
            <button onClick={() => setShowInstallBanner(false)} className="text-white/80 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER SUPERIOR TRANSLÚCIDO COM NAVEGAÇÃO DE MÊS */}
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/80 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-zinc-100 to-zinc-400 rounded-2xl flex items-center justify-center shadow-md shadow-zinc-950">
              <Wallet className="w-6 h-6 text-zinc-900" />
            </div>
            <div>
              <h1 className="font-black text-white text-lg tracking-tight leading-tight">Família Maia Finance</h1>
              
              {/* FILTRO DE MÊS E ANO */}
              <div className="flex items-center gap-1 text-xs text-zinc-300 font-black mt-0.5">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white" title="Mês Anterior">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800/80 rounded-md border border-zinc-700/60 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {currentMonthYear}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white" title="Próximo Mês">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHideValues(!hideValues)}
              className="p-2 text-zinc-300 hover:text-white rounded-xl bg-zinc-800/80 border border-zinc-700/60 transition-all"
              title={hideValues ? "Mostrar valores" : "Ocultar valores"}
            >
              {hideValues ? <EyeOff className="w-4 h-4 text-zinc-300" /> : <Eye className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-full border border-zinc-700 transition-all cursor-pointer"
            >
              {userPhotos[selectedMember] ? (
                <img src={userPhotos[selectedMember]} alt="U" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-900 text-xs font-black flex items-center justify-center">
                  {selectedMember === 'alessandro' ? 'AP' : 'G'}
                </div>
              )}
              <span className="text-xs font-bold text-white capitalize hidden sm:inline">{selectedMember}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-rose-400 rounded-xl hover:bg-zinc-800 transition-all"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* PAINEL CENTRALIZADO */}
      <main className="max-w-4xl mx-auto px-4 pt-5 space-y-5">
        
        {/* CARDS DE MÉTRICAS EXIBIDOS EXCLUSIVAMENTE NA ABA DE RENDA INICIAL */}
        {activeTab === 'renda' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 backdrop-blur-md rounded-2xl p-4 border border-zinc-700/50 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">RENDA TOTAL</div>
                <div className="text-xl font-black text-emerald-400">{formatMoney(totalEntradas)}</div>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 backdrop-blur-md rounded-2xl p-4 border border-zinc-700/50 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">DESPESAS + PARCELAS</div>
                <div className="text-xl font-black text-rose-400">{formatMoney(totalDespesas)}</div>
              </div>
              <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center border border-rose-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 backdrop-blur-md rounded-2xl p-4 border border-zinc-700/50 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">SALDO PROJETADO</div>
                <div className={`text-xl font-black ${saldoProjetado >= 0 ? 'text-white' : 'text-rose-400'}`}>
                  {formatMoney(saldoProjetado)}
                </div>
              </div>
              <div className="w-10 h-10 bg-zinc-100/10 text-white rounded-xl flex items-center justify-center border border-zinc-500/20 shadow-inner">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* CONTÊINER COM AS ABAS */}
        <div>
          
          {/* ABA 1: RENDA FAMÍLIA */}
          {activeTab === 'renda' && (
            <div className="bg-zinc-800/90 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-zinc-700/60 shadow-2xl space-y-6">
              
              {/* RESUMO ORÇAMENTÁRIO VISUAL */}
              <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-700/50 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
                  <span>Resumo Orçamentário Visual</span>
                  <span className="text-zinc-200">{((totalDespesas / totalEntradas) * 100 || 0).toFixed(1)}% Comprometido</span>
                </div>
                
                <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-zinc-800">
                  <div className="bg-emerald-500 h-full rounded-l-full transition-all" style={{ width: `${Math.min(100, (subtotalFixasRenda / totalEntradas) * 100)}%` }} title="Fixas"></div>
                  <div className="bg-sky-500 h-full transition-all" style={{ width: `${Math.min(100, (subtotalVariaveisRenda / totalEntradas) * 100)}%` }} title="Extras"></div>
                  <div className="bg-zinc-200 h-full rounded-r-full transition-all" style={{ width: `${Math.min(100, (subtotalTopicosExtras / totalEntradas) * 100)}%` }} title="Novos Tópicos"></div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Fixa ({formatMoney(subtotalFixasRenda)})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500"></span> Extras ({formatMoney(subtotalVariaveisRenda)})</span>
                  {subtotalTopicosExtras > 0 && (
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-200"></span> Novos Tópicos ({formatMoney(subtotalTopicosExtras)})</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-700/60 pb-4">
                <div>
                  <h2 className="text-base font-black text-white">Rendas & Entradas da Família</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Gerencie salários, extras e crie novos tópicos de receita</p>
                </div>

                <button
                  onClick={() => setShowNovoTopicoModal(true)}
                  className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-black rounded-xl shadow-lg shadow-zinc-950 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Novo Tópico
                </button>
              </div>

              {/* 1. RENDA FIXA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">1. Renda Ficha Garantida</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                    Subtotal: {formatMoney(subtotalFixasRenda)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rendasFixas.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/60 flex items-center justify-between shadow-sm">
                      <div>
                        <div className="text-[11px] text-zinc-400 font-medium">{item.label}</div>
                        <div className="font-bold text-white text-sm">{item.sub}</div>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-700/60 shadow-inner">
                        <span className="text-xs font-bold text-zinc-400">R$</span>
                        <input
                          type="number"
                          value={item.valor}
                          onChange={(e) => updateRendaValue(rendasFixas, setRendasFixas, item.id, e.target.value)}
                          className="w-20 font-black text-white text-right focus:outline-none bg-transparent text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. RENDAS EXTRAS */}
              <div className="p-4 md:p-5 rounded-2xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sky-400 text-xs md:text-sm">
                    <Plus className="w-4 h-4 text-sky-400" />
                    2. Rendas Extras / Variáveis
                  </div>
                  <span className="text-[11px] font-bold text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2.5 py-1 rounded-full">
                    Subtotal: {formatMoney(subtotalVariaveisRenda)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {rendasVariaveis.map((item) => (
                    <div key={item.id} className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700/50 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">{item.label}</div>
                        <div className="text-[10px] text-zinc-400">{item.sub}</div>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-950/80 px-2.5 py-1 rounded-lg border border-zinc-700/60">
                        <span className="text-[10px] font-bold text-zinc-400">R$</span>
                        <input
                          type="number"
                          value={item.valor}
                          onChange={(e) => updateRendaValue(rendasVariaveis, setRendasVariaveis, item.id, e.target.value)}
                          className="w-16 font-bold text-white text-right focus:outline-none bg-transparent text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TÓPICOS NOVOS */}
              {topicosExtras.map((topico) => {
                const subtotalTopico = topico.itens.reduce((sum, i) => sum + Number(i.valor), 0);
                return (
                  <div key={topico.id} className="p-4 md:p-5 rounded-2xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-zinc-200 text-xs md:text-sm">
                        <Layers className="w-4 h-4 text-zinc-300" />
                        {topico.titulo}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-zinc-200 bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded-full">
                          Subtotal: {formatMoney(subtotalTopico)}
                        </span>
                        <button onClick={() => setTopicosExtras(topicosExtras.filter(t => t.id !== topico.id))} className="text-zinc-500 hover:text-rose-400 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {topico.itens.map((item) => (
                        <div key={item.id} className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700/50 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-white">{item.label}</div>
                            <div className="text-[10px] text-zinc-400">{item.sub}</div>
                          </div>
                          <div className="font-bold text-zinc-200 text-xs bg-zinc-950/80 px-2.5 py-1 rounded-lg border border-zinc-700/60">
                            {formatMoney(item.valor)}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          setNovaRendaForm({ topicoTarget: String(topico.id), label: '', sub: '', valor: '' });
                          setShowNovaRendaModal(true);
                        }}
                        className="p-3 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Adicionar Renda
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ABA 2: DESPESAS FIXAS */}
          {activeTab === 'fixas' && (
            <div className="bg-zinc-800/90 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-zinc-700/60 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-700/60 pb-4">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    Despesas Fixas Intocáveis
                    <button onClick={() => setShowFixaModal(true)} className="text-zinc-300 hover:text-white">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Contas recorrentes do mês (Marque o check quando pagar)</p>
                </div>

                <button
                  onClick={() => setShowFixaModal(true)}
                  className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-black rounded-xl shadow-lg shadow-zinc-950 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              <div className="space-y-3">
                {despesasFixas.map((item) => {
                  const pago = isPago('fixa', item.id);
                  return (
                    <div key={item.id} className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${pago ? 'bg-zinc-950/40 border-emerald-500/30 opacity-75' : 'bg-zinc-900/80 border-zinc-700/50'}`}>
                      <div className="flex items-center gap-3">
                        <button onClick={() => togglePago('fixa', item.id)} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                          {pago ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-zinc-500" />}
                        </button>
                        <div>
                          <div className={`font-semibold text-sm ${pago ? 'line-through text-zinc-400' : 'text-white'}`}>{item.nome}</div>
                          <div className="text-[11px] text-zinc-400">{item.categoria} {pago && '• (Pago neste mês)'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-extrabold text-white text-sm">{formatMoney(item.valor)}</div>
                        <button onClick={() => setDespesasFixas(despesasFixas.filter(f => f.id !== item.id))} className="text-zinc-600 hover:text-rose-400 transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-zinc-700/60 flex justify-between items-center text-sm">
                <span className="font-semibold text-zinc-300">Total Fixas:</span>
                <span className="font-black text-zinc-100 text-base">{formatMoney(totalFixas)}</span>
              </div>
            </div>
          )}

          {/* ABA 3: DÍVIDAS E PARCELAS */}
          {activeTab === 'parcelas' && (
            <div className="bg-zinc-800/90 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-zinc-700/60 shadow-2xl space-y-6">
              
              {/* BANNER DE ALERTA DE VENCIMENTO */}
              {contasProximasDoVencimento.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center gap-3 shadow-lg animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-rose-200 text-xs md:text-sm">
                      Alerta de Vencimento Próximo em {currentMonthYear} ({contasProximasDoVencimento.length} contas)
                    </div>
                    <div className="text-[11px] text-rose-300/80 mt-0.5">
                      Faltam menos de 3 dias para vencer: {contasProximasDoVencimento.map(c => c.nome).join(', ')}.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-zinc-700/60 pb-4">
                <div>
                  <h2 className="text-base font-black text-white">Parcelas Ativas em {currentMonthYear}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Dívidas e parcelamentos vigentes (Marque o check ao quitar)</p>
                </div>

                <button
                  onClick={() => setShowParcelaModal(true)}
                  className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-black rounded-xl shadow-lg shadow-zinc-950 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Nova Parcela
                </button>
              </div>

              {parcelasAtivasNoMes.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs font-semibold">
                  Nenhuma dívida ou parcela pendente para {currentMonthYear}! 🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {parcelasAtivasNoMes.map((item) => {
                    const diffDays = item.diaVencimento - hoje.getDate();
                    const pago = isPago('parcela', item.id);
                    const estaUrgente = eMesAtualEmTempoReal && !pago && diffDays >= 0 && diffDays <= 3;

                    return (
                      <div 
                        key={item.id} 
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                          pago 
                            ? 'bg-zinc-950/40 border-emerald-500/30 opacity-75' 
                            : estaUrgente 
                              ? 'bg-rose-950/30 border-rose-500/50 shadow-md ring-1 ring-rose-500/30' 
                              : 'bg-zinc-900/80 backdrop-blur-sm border-zinc-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button onClick={() => togglePago('parcela', item.id)} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                            {pago ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-zinc-500" />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-semibold text-sm ${pago ? 'line-through text-zinc-400' : 'text-white'}`}>{item.nome}</span>
                              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded-md border border-zinc-700">
                                {item.tag}
                              </span>
                              {estaUrgente && (
                                <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-md animate-pulse">
                                  VENCE EM {diffDays === 0 ? 'HOJE' : `${diffDays} DIA(S)`}
                                </span>
                              )}
                              {pago && (
                                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[9px] font-bold rounded-md border border-emerald-800">
                                  QUITADO
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              Parcela: <span className="font-semibold text-zinc-200">{item.parcelaExibida}</span> • Vencimento: Dia {item.diaVencimento}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`font-black text-sm ${pago ? 'text-zinc-400 line-through' : 'text-white'}`}>{formatMoney(item.valor)}</div>
                          <button onClick={() => setParcelas(parcelas.filter(p => p.id !== item.id))} className="text-zinc-600 hover:text-rose-400 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-zinc-700/60 flex justify-between items-center text-sm">
                <span className="font-semibold text-zinc-300">Total Dívidas ({currentMonthYear}):</span>
                <span className="font-black text-rose-400 text-base">{formatMoney(totalParcelasDoMes)}</span>
              </div>
            </div>
          )}

          {/* ABA 4: CAIXINHAS (PAINEL REDESENHADO ULTRA-MODERNO) */}
          {activeTab === 'caixinhas' && (
            <div className="bg-zinc-800/90 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-zinc-700/60 shadow-2xl space-y-6">
              {!isPinUnlocked ? (
                <div className="max-w-md mx-auto py-12 text-center space-y-6">
                  <div className="w-16 h-16 bg-zinc-900 text-zinc-300 border border-zinc-700/60 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Cofre de Investimentos Família Maia</h3>
                    <p className="text-xs text-zinc-400 mt-1">Digite o PIN privado de 4 dígitos para gerenciar seus investimentos</p>
                  </div>

                  <form onSubmit={handleUnlockPin} className="space-y-4 max-w-xs mx-auto">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="PIN"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full text-center py-3.5 px-4 text-xl font-black tracking-widest rounded-2xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    />
                    {pinError && <p className="text-xs text-rose-400 font-semibold">PIN Incorreto!</p>}

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 font-black rounded-xl shadow-lg shadow-zinc-950 text-sm transition-all"
                    >
                      Confirmar Acesso Privado
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* CABEÇALHO DO PAINEL DAS CAIXINHAS */}
                  <div className="flex items-center justify-between border-b border-zinc-700/60 pb-4">
                    <div>
                      <h2 className="text-base font-black text-white flex items-center gap-2">
                        <span>Cofre & Investimentos</span>
                        <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Rendimento Ativo
                        </span>
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">Gestão de patrimônio, CDI e proteções contra inflação</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCaixinhaForm({ id: null, nome: '', meta: '', atual: '', tipoInvest: 'CDB 100% CDI (Liquidez Diária)', icone: '🛡️', cor: 'from-emerald-500 to-teal-600' });
                          setShowNovaCaixinhaModal(true);
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Nova Caixinha
                      </button>

                      <button onClick={() => setIsPinUnlocked(false)} className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-xl border border-zinc-700" title="Bloquear Cofre">
                        <Lock className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* CARDS DE MÉTRICAS EXCLUSIVOS DO COFRE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-4 rounded-2xl border border-zinc-700/50 flex justify-between items-center shadow-lg">
                      <div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">TOTAL ACUMULADO</div>
                        <div className="text-lg font-black text-emerald-400">{formatMoney(totalAcumuladoCaixinhas)}</div>
                      </div>
                      <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                        <Shield className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-4 rounded-2xl border border-zinc-700/50 flex justify-between items-center shadow-lg">
                      <div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">FALTANTE PARA META GLOBAL</div>
                        <div className="text-lg font-black text-amber-400">{formatMoney(totalFaltanteCaixinhas)}</div>
                      </div>
                      <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20 shadow-inner">
                        <Target className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-4 rounded-2xl border border-zinc-700/50 flex justify-between items-center shadow-lg">
                      <div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">CONCLUSÃO GLOBAL</div>
                        <div className="text-lg font-black text-white">{percentualGlobalCaixinhas}%</div>
                      </div>
                      <div className="w-10 h-10 bg-zinc-100/10 text-white rounded-xl flex items-center justify-center border border-zinc-500/20 shadow-inner">
                        <Percent className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* GRÁFICO DE PROGRESSO GLOBAL DO COFRE */}
                  <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 rounded-2xl border border-zinc-700/50 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">Alocação e Progresso das Metas do Cofre</h3>
                      <span className="text-[11px] font-bold text-zinc-400">Meta Global: {formatMoney(totalMetaCaixinhas)}</span>
                    </div>

                    <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-zinc-800">
                      {caixinhas.map((box) => {
                        const pctRelativo = totalMetaCaixinhas > 0 ? (box.atual / totalMetaCaixinhas) * 100 : 0;
                        return (
                          <div 
                            key={box.id} 
                            className={`h-full bg-gradient-to-r ${box.cor} transition-all duration-500`} 
                            style={{ width: `${pctRelativo}%` }}
                            title={`${box.nome}: ${formatMoney(box.atual)}`}
                          ></div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {caixinhas.map((box) => (
                        <div key={box.id} className="text-[10px] text-zinc-300 flex items-center gap-1.5 truncate bg-zinc-800/60 px-2.5 py-1.5 rounded-lg border border-zinc-700/40">
                          <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${box.cor} flex-shrink-0`}></span>
                          <span className="truncate font-medium">{box.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LISTA DAS CAIXINHAS (DESIGN ULTRA-MODERNO GLASSMORPHIC) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caixinhas.map((box) => {
                      const progresso = Math.min(100, Math.round((box.atual / box.meta) * 100));
                      const faltanteIndividual = Math.max(0, box.meta - box.atual);

                      return (
                        <div key={box.id} className="p-5 rounded-3xl border border-zinc-700/60 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-xl space-y-4 shadow-2xl relative overflow-hidden group hover:border-zinc-500 transition-all">
                          <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${box.cor} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-all`}></div>

                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${box.cor} flex items-center justify-center text-2xl shadow-lg`}>
                                {box.icone}
                              </div>
                              <div>
                                <span className="font-extrabold text-white text-sm block leading-tight">{box.nome}</span>
                                <span className="text-[11px] text-zinc-400 font-medium">{box.tipoInvest}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white bg-zinc-800/90 px-2.5 py-1 rounded-full border border-zinc-700/80 shadow-sm">
                                {progresso}%
                              </span>
                              
                              <button
                                onClick={() => {
                                  setCaixinhaForm({
                                    id: box.id,
                                    nome: box.nome,
                                    meta: String(box.meta),
                                    atual: String(box.atual),
                                    tipoInvest: box.tipoInvest,
                                    icone: box.icone,
                                    cor: box.cor
                                  });
                                  setShowNovaCaixinhaModal(true);
                                }}
                                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-700/50"
                                title="Editar Caixinha"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setCaixinhas(caixinhas.filter(c => c.id !== box.id))}
                                className="p-1.5 text-zinc-500 hover:text-rose-400 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-700/50"
                                title="Remover Caixinha"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5 relative z-10">
                            <div className="flex justify-between text-xs text-zinc-300">
                              <span>Acumulado: <strong className="text-white">{formatMoney(box.atual)}</strong></span>
                              <span>Meta: {formatMoney(box.meta)}</span>
                            </div>
                            
                            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800/80 shadow-inner">
                              <div className={`h-full bg-gradient-to-r ${box.cor} rounded-full transition-all duration-500`} style={{ width: `${progresso}%` }}></div>
                            </div>

                            <div className="text-[10px] text-zinc-400 text-right pt-0.5">
                              Faltam <strong className="text-amber-400">{formatMoney(faltanteIndividual)}</strong> para atingir a meta
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-zinc-800/80 relative z-10">
                            <button
                              onClick={() => setActiveCaixinhaModal({ id: box.id, nome: box.nome, tipo: 'guardar' })}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
                            >
                              <ArrowUpRight className="w-4 h-4" /> + Guardar
                            </button>
                            <button
                              onClick={() => setActiveCaixinhaModal({ id: box.id, nome: box.nome, tipo: 'retirar' })}
                              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <ArrowDownLeft className="w-4 h-4" /> Retirar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA 5: RELATÓRIO COM EXPORTAÇÃO PDF E FOTO */}
          {activeTab === 'relatorio' && (
            <div className="bg-zinc-800/90 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-zinc-700/60 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-700/60 pb-4">
                <div>
                  <h2 className="text-base font-black text-white">Relatório de Saúde Financeira ({currentMonthYear})</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Visão consolidada do orçamento e percentual de gasto</p>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={handleGerarPDFRelatorio} className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-black rounded-xl border border-zinc-700 flex items-center gap-1.5 shadow-md transition-all">
                    <FileText className="w-3.5 h-3.5 text-zinc-900" />
                    Gerar PDF Formal
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl border border-zinc-700/50 flex flex-col items-center justify-center text-center relative">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="60" stroke="#27272a" strokeWidth="16" fill="transparent" />
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      stroke="#f4f4f5"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * Math.min(100, (totalDespesas / totalEntradas) * 100)) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-white">{((totalDespesas / totalEntradas) * 100 || 0).toFixed(0)}%</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Comprometido</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-semibold text-white">Renda Bruta Total</span>
                    </div>
                    <span className="font-black text-emerald-400 text-sm">{formatMoney(totalEntradas)}</span>
                  </div>

                  <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span className="text-xs font-semibold text-white">Comprometimento Mensal</span>
                    </div>
                    <span className="font-black text-rose-400 text-sm">{formatMoney(totalDespesas)}</span>
                  </div>

                  <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-zinc-200"></span>
                      <span className="text-xs font-semibold text-white">Sobra para Reserva</span>
                    </div>
                    <span className={`font-black text-sm ${saldoProjetado >= 0 ? 'text-white' : 'text-rose-400'}`}>
                      {formatMoney(saldoProjetado)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 📱 BOTTOM BAR NAVEGAÇÃO TRANSLÚCIDA FOSCA */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 py-2.5">
        <div className="max-w-md mx-auto bg-zinc-900/90 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl p-1.5 shadow-2xl grid grid-cols-5 gap-1 text-center">
          <button
            onClick={() => setActiveTab('renda')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'renda' ? 'bg-zinc-800 text-white font-bold scale-105 border border-zinc-600/80 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Renda</span>
          </button>

          <button
            onClick={() => setActiveTab('fixas')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'fixas' ? 'bg-zinc-800 text-white font-bold scale-105 border border-zinc-600/80 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Fixas</span>
          </button>

          <button
            onClick={() => setActiveTab('parcelas')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'parcelas' ? 'bg-zinc-800 text-white font-bold scale-105 border border-zinc-600/80 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Dívidas</span>
          </button>

          <button
            onClick={() => setActiveTab('caixinhas')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'caixinhas' ? 'bg-zinc-800 text-white font-bold scale-105 border border-zinc-600/80 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Caixinhas</span>
          </button>

          <button
            onClick={() => setActiveTab('relatorio')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'relatorio' ? 'bg-zinc-800 text-white font-bold scale-105 border border-zinc-600/80 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PieChart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Relatório</span>
          </button>
        </div>
      </nav>

      {/* MODAL PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-5 border border-zinc-700 relative shadow-2xl">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <h3 className="font-bold text-white text-base">Foto de Perfil</h3>
              
              <div className="relative w-24 h-24 mx-auto">
                {userPhotos[selectedMember] ? (
                  <img src={userPhotos[selectedMember]} alt="P" className="w-full h-full rounded-full object-cover border-4 border-zinc-600/40" />
                ) : (
                  <div className="w-full h-full rounded-full bg-zinc-100 text-zinc-900 font-black text-2xl flex items-center justify-center border-4 border-zinc-600/40">
                    {selectedMember === 'alessandro' ? 'AP' : 'G'}
                  </div>
                )}

                <label className="absolute bottom-0 right-0 bg-zinc-100 text-zinc-900 p-2.5 rounded-full cursor-pointer hover:bg-white transition-all shadow-md">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoUpload(e, selectedMember)} />
                </label>
              </div>

              <div>
                <div className="font-bold text-white text-base capitalize">{selectedMember}</div>
                <div className="text-xs text-zinc-400">Toque na câmera para carregar da galeria/câmera</div>
              </div>
            </div>

            <button onClick={() => setShowProfileModal(false)} className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-xl text-xs transition-all">
              Concluído
            </button>
          </div>
        </div>
      )}

      {/* MODAL CRIAR / EDITAR CAIXINHA */}
      {showNovaCaixinhaModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-zinc-700/80 relative shadow-2xl">
            <button onClick={() => setShowNovaCaixinhaModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-white text-base">{caixinhaForm.id ? 'Editar Caixinha' : 'Nova Caixinha / Fundo'}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Nome da Caixinha</label>
                <input
                  type="text"
                  placeholder="Ex: Obra da Casa, Viagem, Carro"
                  value={caixinhaForm.nome}
                  onChange={(e) => setCaixinhaForm({ ...caixinhaForm, nome: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Estratégia / Tipo de Rendimento</label>
                <select
                  value={caixinhaForm.tipoInvest}
                  onChange={(e) => setCaixinhaForm({ ...caixinhaForm, tipoInvest: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                >
                  <option value="CDB 100% CDI (Liquidez Diária)">CDB 100% CDI (Liquidez Diária)</option>
                  <option value="Tesouro Selic (Pós-fixado)">Tesouro Selic (Pós-fixado)</option>
                  <option value="IPCA+ (Proteção Inflação)">IPCA+ (Proteção Inflação)</option>
                  <option value="Fundos Imobiliários (FIIs)">Fundos Imobiliários (FIIs)</option>
                  <option value="Rendimento Fixo Diário">Rendimento Fixo Diário</option>
                  <option value="Poupança / Guardado">Poupança / Guardado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Meta Total (R$)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={caixinhaForm.meta}
                    onChange={(e) => setCaixinhaForm({ ...caixinhaForm, meta: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Já Salvo (R$)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={caixinhaForm.atual}
                    onChange={(e) => setCaixinhaForm({ ...caixinhaForm, atual: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowNovaCaixinhaModal(false)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs">Cancelar</button>
              <button onClick={handleSalvarCaixinha} className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-black rounded-xl text-xs transition-all shadow-md">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO TÓPICO DE RENDA */}
      {showNovoTopicoModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-zinc-700 relative shadow-2xl">
            <button onClick={() => setShowNovoTopicoModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="font-bold text-white text-base">Criar Novo Tópico de Renda</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Nome do Tópico</label>
                <input
                  type="text"
                  placeholder="Ex: Renda de Investimentos, Vendas"
                  value={novoTopicoNome}
                  onChange={(e) => setNovoTopicoNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowNovoTopicoModal(false)} className="flex-1 py-2.5 bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs">Cancelar</button>
              <button onClick={handleCriarTopico} className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-xl text-xs transition-all">
                Criar Tópico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVA RENDA ADICIONAL */}
      {showNovaRendaModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-zinc-700 relative shadow-2xl">
            <button onClick={() => setShowNovaRendaModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="font-bold text-white text-base">Adicionar Item de Renda</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Descrição da Entrada</label>
                <input
                  type="text"
                  placeholder="Ex: Venda de equipamento, Rendimento"
                  value={novaRendaForm.label}
                  onChange={(e) => setNovaRendaForm({ ...novaRendaForm, label: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Detalhe / Subtítulo</label>
                <input
                  type="text"
                  placeholder="Ex: Variável, Previsão"
                  value={novaRendaForm.sub}
                  onChange={(e) => setNovaRendaForm({ ...novaRendaForm, sub: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Valor (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={novaRendaForm.valor}
                  onChange={(e) => setNovaRendaForm({ ...novaRendaForm, valor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowNovaRendaModal(false)} className="flex-1 py-2.5 bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs">Cancelar</button>
              <button onClick={handleAdicionarItemRenda} className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-xl text-xs transition-all">
                Salvar Renda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARCELA */}
      {showParcelaModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 border border-zinc-700 relative shadow-2xl">
            <button onClick={() => setShowParcelaModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="font-bold text-white text-base">Adicionar Nova Parcela</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Empréstimo, Compra cartão"
                  value={novaParcela.nome}
                  onChange={(e) => setNovaParcela({ ...novaParcela, nome: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Valor (R$)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={novaParcela.valor}
                    onChange={(e) => setNovaParcela({ ...novaParcela, valor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Dia de Vencimento</label>
                  <input
                    type="number"
                    placeholder="Ex: 10"
                    value={novaParcela.diaVencimento}
                    onChange={(e) => setNovaParcela({ ...novaParcela, diaVencimento: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Parcela Atual</label>
                  <input
                    type="number"
                    value={novaParcela.parcelaAtual}
                    onChange={(e) => setNovaParcela({ ...novaParcela, parcelaAtual: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Total de Parcelas</label>
                  <input
                    type="number"
                    value={novaParcela.totalParcelas}
                    onChange={(e) => setNovaParcela({ ...novaParcela, totalParcelas: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowParcelaModal(false)} className="flex-1 py-2.5 bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs">Cancelar</button>
              <button
                onClick={() => {
                  if (novaParcela.nome && novaParcela.valor) {
                    setParcelas([...parcelas, {
                      id: Date.now(),
                      ...novaParcela,
                      valor: Number(novaParcela.valor),
                      mesInicio: currentDate.getMonth(),
                      anoInicio: currentDate.getFullYear()
                    }]);
                    setShowParcelaModal(false);
                    setNovaParcela({ nome: '', tag: 'Geral', valor: '', parcelaAtual: 1, totalParcelas: 1, diaVencimento: 10 });
                  }
                }}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-xl text-xs transition-all"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FIXA */}
      {showFixaModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-zinc-700 relative shadow-2xl">
            <button onClick={() => setShowFixaModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="font-bold text-white text-base">Nova Despesa Fixa</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Nome da Despesa</label>
                <input
                  type="text"
                  placeholder="Ex: Luz, Gás, Internet"
                  value={novaFixa.nome}
                  onChange={(e) => setNovaFixa({ ...novaFixa, nome: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Valor (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={novaFixa.valor}
                  onChange={(e) => setNovaFixa({ ...novaFixa, valor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm mt-1 focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowFixaModal(false)} className="flex-1 py-2.5 bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs">Cancelar</button>
              <button
                onClick={() => {
                  if (novaFixa.nome && novaFixa.valor) {
                    setDespesasFixas([...despesasFixas, { id: Date.now(), ...novaFixa, valor: Number(novaFixa.valor) }]);
                    setShowFixaModal(false);
                    setNovaFixa({ nome: '', categoria: 'Geral', valor: '' });
                  }
                }}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-xl text-xs transition-all"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GUARDAR / RETIRAR NA CAIXINHA */}
      {activeCaixinhaModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-zinc-700 relative shadow-2xl">
            <button onClick={() => setActiveCaixinhaModal(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="font-bold text-white text-base capitalize">
              {activeCaixinhaModal.tipo === 'guardar' ? 'Guardar em' : 'Retirar de'} {activeCaixinhaModal.nome}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase">Valor (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  autoFocus
                  value={caixinhaValorInput}
                  onChange={(e) => setCaixinhaValorInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-extrabold text-lg mt-1 focus:outline-none focus:border-zinc-400"
                />
              </div>

              {activeCaixinhaModal.tipo === 'guardar' && (
                <div className="flex gap-2">
                  <button onClick={() => setCaixinhaValorInput('50')} className="flex-1 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs font-bold">+ R$ 50</button>
                  <button onClick={() => setCaixinhaValorInput('100')} className="flex-1 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs font-bold">+ R$ 100</button>
                  <button onClick={() => setCaixinhaValorInput('200')} className="flex-1 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs font-bold">+ R$ 200</button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setActiveCaixinhaModal(null)} className="flex-1 py-2.5 bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs">Cancelar</button>
              <button
                onClick={() => handleMovimentarCaixinha(caixinhaValorInput)}
                className={`flex-1 py-2.5 text-white font-bold rounded-xl text-xs transition-all ${
                  activeCaixinhaModal.tipo === 'guardar' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}