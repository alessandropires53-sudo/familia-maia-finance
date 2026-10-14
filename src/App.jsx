import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, Calendar, CreditCard, Shield, PieChart, Lock, Eye, EyeOff, 
  Plus, Trash2, CheckSquare, Square, LogOut, ArrowUpRight, 
  Edit3, X, ChevronLeft, ChevronRight, PlusCircle, MinusCircle,
  Printer, Target, Percent, Delete, Bell, AlertCircle
} from 'lucide-react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function App() {
  // --- AUTENTICAÇÃO PRINCIPAL (TECLADO TÁTIL iOS 6 DÍGITOS: 235103) ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  // --- NAVEGAÇÃO DE MESES (INICIALIZA AUTOMATICAMENTE NO MÊS ATUAL DO CELULAR) ---
  const [dataAtual, setDataAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  // --- NAVEGAÇÃO DE ABAS & UI ---
  const [abaAtiva, setAbaAtiva] = useState('renda'); // renda, fixas, dividas, caixinhas, relatorio
  const [ocultarValores, setOcultarValores] = useState(false);

  // --- CAIXINHA PROTEGIDA ---
  const [pinCaixinha, setPinCaixinha] = useState('');
  const [caixinhaDesbloqueada, setCaixinhaDesbloqueada] = useState(false);
  const [erroPin, setErroPin] = useState('');

  // --- PERMISSÃO DE NOTIFICAÇÃO ---
  const [permissaoNotificacao, setPermissaoNotificacao] = useState('default');

  // --- MODAIS ---
  const [modalParcelaAberta, setModalParcelaAberta] = useState(false);
  const [modalFixaAberta, setModalFixaAberta] = useState(false);
  const [modalRendaAberta, setModalRendaAberta] = useState(false);
  const [modalCaixinhaAberta, setModalCaixinhaAberta] = useState(false);
  const [modalEditarRenda, setModalEditarRenda] = useState(null);
  const [modalOperacaoCaixinha, setModalOperacaoCaixinha] = useState(null);
  const [valorOperacaoCaixinha, setValorOperacaoCaixinha] = useState('');

  // --- ESTADOS DE DADOS FINANCEIROS ---
  const [rendas, setRendas] = useState([
    { id: 1, categoria: 'garantida', titulo: 'Alessandro (Wlinks)', descricao: 'Salário Fixo', valor: 1180 },
    { id: 2, categoria: 'garantida', titulo: 'Giovanna', descricao: 'Salário Fixo', valor: 1650 },
    { id: 3, categoria: 'garantida', titulo: 'Academia', descricao: 'Faxina Aos Sábados', valor: 840 },
    { id: 4, categoria: 'extra', titulo: 'Renda Extra (Esposa)', descricao: 'Trabalhos adicionais', valor: 490 },
    { id: 5, categoria: 'extra', titulo: 'Premiação / Meta Trabalho', descricao: 'Estimado (Pode variar)', valor: 300 },
    { id: 6, categoria: 'extra', titulo: 'Entrega Motoboy', descricao: 'Extra / Variável', valor: 350 },
  ]);

  // pagamentos: array de meses pagos no formato 'YYYY-MM'
  const [fixas, setFixas] = useState([
    { id: 1, titulo: 'Internet Fibra (Sua parte)', tag: 'Serviços', valor: 75, pagamentos: [], vencimento: '10' },
    { id: 2, titulo: 'Plano Celular Casal', tag: 'Comunicação', valor: 100, pagamentos: [], vencimento: '15' },
    { id: 3, titulo: 'Gasolina Moto', tag: 'Transporte', valor: 50, pagamentos: [], vencimento: '05' },
    { id: 4, titulo: 'Cuidado das Crianças (Pai)', tag: 'Família', valor: 150, pagamentos: [], vencimento: '10' },
  ]);

  const [parcelas, setParcelas] = useState([
    { id: 1, titulo: 'Cartão da Tia (Fatura Principal)', tag: 'Cartão Principal', valor: 2052, parcelaatual: 1, totalparcelas: 99, vencimento: '10', mesInicio: '2026-10', pagamentos: [] },
    { id: 2, titulo: 'Dívida Primo #1', tag: 'Empréstimo', valor: 121, parcelaatual: 8, totalparcelas: 10, vencimento: '05', mesInicio: '2026-03', pagamentos: [] },
    { id: 3, titulo: 'Dívida Primo #2', tag: 'Empréstimo', valor: 211, parcelaatual: 5, totalparcelas: 10, vencimento: '05', mesInicio: '2026-06', pagamentos: [] },
    { id: 4, titulo: 'Dívida Primo #3', tag: 'Empréstimo', valor: 107, parcelaatual: 3, totalparcelas: 6, vencimento: '05', mesInicio: '2026-08', pagamentos: [] },
    { id: 5, titulo: 'Cabelo alessandro', tag: 'Geral', valor: 85, parcelaatual: 1, totalparcelas: 1, vencimento: '10', mesInicio: '2026-10', pagamentos: [] },
    { id: 6, titulo: 'pneu', tag: 'Geral', valor: 140, parcelaatual: 1, totalparcelas: 1, vencimento: '10', mesInicio: '2026-10', pagamentos: [] },
  ]);

  const [caixinhas, setCaixinhas] = useState([
    { id: 1, titulo: 'Reserva de Emergência', sub: 'CDB 100% CDI (Liquidez Diária)', acumulado: 0, meta: 1000, cor: '#10b981', emoji: '🛡️' },
    { id: 2, titulo: 'Festa de 1 Aninho', sub: 'Rendimento Fixo Diário', acumulado: 0, meta: 4000, cor: '#d946ef', emoji: '🎂' },
    { id: 3, titulo: 'Casamento & Viagem', sub: 'Tesouro Selic (Pós-fixado)', acumulado: 0, meta: 45000, cor: '#f59e0b', emoji: '💍' },
    { id: 4, titulo: 'Obra da Casa (Laje e Muro)', sub: 'IPCA+ (Proteção Inflação)', acumulado: 0, meta: 75000, cor: '#3b82f6', emoji: '🏗️' },
  ]);

  // --- FORMULÁRIOS DE NOVOS ITENS ---
  const mesFormatadoIso = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;
  const [novaParcela, setNovaParcela] = useState({ titulo: '', valor: '', vencimento: '10', parcelaatual: 1, totalparcelas: 1, tag: 'Geral', mesInicio: mesFormatadoIso });
  const [novaFixa, setNovaFixa] = useState({ titulo: '', valor: '', vencimento: '10', tag: 'Serviços' });
  const [novaRenda, setNovaRenda] = useState({ titulo: '', descricao: '', valor: '', categoria: 'garantida' });
  const [novaCaixinha, setNovaCaixinha] = useState({ titulo: '', sub: '', meta: '', acumulado: '0', cor: '#a855f7', emoji: '🎯' });

  // --- SINCRONIZAÇÃO EM TEMPO REAL FIREBASE ---
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "familia_maia", "dados_financeiros"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        isRemoteUpdate.current = true;
        if (data.rendas) setRendas(data.rendas);
        if (data.fixas) setFixas(data.fixas);
        if (data.parcelas) setParcelas(data.parcelas);
        if (data.caixinhas) setCaixinhas(data.caixinhas);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    const salvarNoFirebase = async () => {
      try {
        await setDoc(doc(db, "familia_maia", "dados_financeiros"), {
          rendas,
          fixas,
          parcelas,
          caixinhas,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Erro ao sincronizar com Firebase:", err);
      }
    };
    salvarNoFirebase();
  }, [rendas, fixas, parcelas, caixinhas]);

  // --- NOTIFICAÇÕES DO CELULAR ---
  useEffect(() => {
    if ('Notification' in window) {
      setPermissaoNotificacao(Notification.permission);
    }
  }, []);

  const solicitarPermissaoNotificacao = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setPermissaoNotificacao(permission);
        if (permission === 'granted') {
          new Notification("Família Maia Finance", {
            body: "Notificações ativadas! Você receberá alertas de vencimento de contas.",
            icon: "/pwa-192x192.png"
          });
        }
      });
    }
  };

  // --- CONTROLE DE MÊS ---
  const mesFormatado = dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const mesFormatadoCapitalized = mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1);
  const mesChaveAtual = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;

  const mudarMes = (delta) => {
    const novaData = new Date(dataAtual);
    novaData.setMonth(novaData.getMonth() + delta);
    setDataAtual(novaData);
  };

  // --- LOGIN COM TECLADO TÁTIL ESTILO iOS (6 DÍGITOS: 235103) ---
  const handleDigitarNumero = (num) => {
    if (senhaDigitada.length < 6) {
      const novaSenha = senhaDigitada + num;
      setSenhaDigitada(novaSenha);
      setErroLogin('');

      if (novaSenha.length === 6) {
        if (novaSenha === '235103') {
          setIsAuthenticated(true);
          setSenhaDigitada('');
          setErroLogin('');
        } else {
          setErroLogin('Senha incorreta, tente novamente.');
          setTimeout(() => setSenhaDigitada(''), 600);
        }
      }
    }
  };

  const handleApagarNumero = () => {
    setSenhaDigitada(prev => prev.slice(0, -1));
    setErroLogin('');
  };

  const handleAcessarCaixinha = (e) => {
    e.preventDefault();
    if (pinCaixinha === '2351') {
      setCaixinhaDesbloqueada(true);
      setErroPin('');
    } else {
      setErroPin('PIN incorreto!');
    }
  };

  // --- FILTRO INTELIGENTE DE PARCELAS POR MÊS SELECIONADO ---
  const obterParcelasDoMes = () => {
    const anoAtual = dataAtual.getFullYear();
    const mesAtualIndex = dataAtual.getMonth();

    return parcelas.map(p => {
      if (!p.mesInicio) return p;
      const [anoStart, mesStart] = p.mesInicio.split('-').map(Number);
      const diffMeses = (anoAtual - anoStart) * 12 + (mesAtualIndex - (mesStart - 1));

      if (diffMeses < 0 || diffMeses >= p.totalparcelas) {
        return null;
      }

      const numParcelaNoMes = p.parcelaatual + diffMeses;
      const estaPagoNoMes = Array.isArray(p.pagamentos) && p.pagamentos.includes(mesChaveAtual);

      return {
        ...p,
        parcelaExibida: numParcelaNoMes,
        pagoNoMes: estaPagoNoMes
      };
    }).filter(Boolean);
  };

  const parcelasAtivasNoMes = obterParcelasDoMes();

  const fixasAtivasNoMes = fixas.map(f => ({
    ...f,
    pagoNoMes: Array.isArray(f.pagamentos) && f.pagamentos.includes(mesChaveAtual)
  }));

  // --- HELPER CÁLCULO DE VENCIMENTO EM DIAS ---
  const calcularAlertaVencimento = (diaVencimento, estaPago) => {
    if (estaPago) return null;
    const diaVenc = Number(diaVencimento);
    if (!diaVenc) return null;

    const hoje = new Date();
    const mesAtualVisual = dataAtual.getMonth();
    const anoAtualVisual = dataAtual.getFullYear();

    // Se estiver no mês do calendário real
    if (hoje.getMonth() === mesAtualVisual && hoje.getFullYear() === anoAtualVisual) {
      const diaHoje = hoje.getDate();
      const diffDias = diaVenc - diaHoje;

      if (diffDias === 0) {
        return { texto: 'VENCE HOJE!', urgente: true };
      } else if (diffDias > 0 && diffDias <= 3) {
        return { texto: `Vence em ${diffDias} dia${diffDias > 1 ? 's' : ''}`, urgente: false };
      } else if (diffDias < 0) {
        return { texto: 'Vencida', urgente: true };
      }
    }
    return null;
  };

  // --- VERIFICADOR E ENVIO DE NOTIFICAÇÕES PUSH ---
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && Notification.permission === 'granted') {
      const hoje = new Date();
      const mesAtualReal = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
      const diaHoje = hoje.getDate();

      const pendentesAvisar = [
        ...fixas.map(f => ({ ...f, tipo: 'Fixa', pagoNoMes: Array.isArray(f.pagamentos) && f.pagamentos.includes(mesAtualReal) })),
        ...parcelas.map(p => ({ ...p, tipo: 'Parcela', pagoNoMes: Array.isArray(p.pagamentos) && p.pagamentos.includes(mesAtualReal) }))
      ].filter(item => {
        if (item.pagoNoMes) return false;
        const diff = Number(item.vencimento) - diaHoje;
        return diff >= 0 && diff <= 2;
      });

      if (pendentesAvisar.length > 0) {
        pendentesAvisar.forEach(item => {
          const diff = Number(item.vencimento) - diaHoje;
          const msg = diff === 0 ? `A conta ${item.titulo} vence HOJE!` : `A conta ${item.titulo} vence em ${diff} dia(s).`;
          new Notification("Alerta de Vencimento • Família Maia", {
            body: msg,
            icon: "/pwa-192x192.png"
          });
        });
      }
    }
  }, [isAuthenticated]);

  // --- CÁLCULOS DINÂMICOS ---
  const totalRendaGarantida = rendas.filter(r => r.categoria === 'garantida').reduce((acc, r) => acc + Number(r.valor), 0);
  const totalRendaExtra = rendas.filter(r => r.categoria === 'extra').reduce((acc, r) => acc + Number(r.valor), 0);
  const rendaTotal = totalRendaGarantida + totalRendaExtra;

  const fixasPagar = fixasAtivasNoMes.filter(f => !f.pagoNoMes).reduce((acc, f) => acc + Number(f.valor), 0);
  const totalFixasBruto = fixasAtivasNoMes.reduce((acc, f) => acc + Number(f.valor), 0);

  const parcelasPagar = parcelasAtivasNoMes.filter(p => !p.pagoNoMes).reduce((acc, p) => acc + Number(p.valor), 0);
  const totalParcelasBruto = parcelasAtivasNoMes.reduce((acc, p) => acc + Number(p.valor), 0);

  const despesasAbertasTotal = fixasPagar + parcelasPagar;
  const despesasBrutasTotal = totalFixasBruto + totalParcelasBruto;
  const saldoProjetado = rendaTotal - despesasAbertasTotal;
  const pctComprometido = rendaTotal > 0 ? ((despesasBrutasTotal / rendaTotal) * 100).toFixed(1) : 0;

  const totalAcumuladoCaixinhas = caixinhas.reduce((acc, c) => acc + Number(c.acumulado), 0);
  const metaGlobalCaixinhas = caixinhas.reduce((acc, c) => acc + Number(c.meta), 0);

  // --- HANDLERS TOGGLE DE PAGAMENTO ISOLADO POR MÊS ---
  const toggleFixaPago = (id) => {
    setFixas(fixas.map(f => {
      if (f.id === id) {
        const pagamentosAtuais = Array.isArray(f.pagamentos) ? f.pagamentos : [];
        const jaPago = pagamentosAtuais.includes(mesChaveAtual);
        const novosPagamentos = jaPago 
          ? pagamentosAtuais.filter(m => m !== mesChaveAtual)
          : [...pagamentosAtuais, mesChaveAtual];
        return { ...f, pagamentos: novosPagamentos };
      }
      return f;
    }));
  };

  const toggleParcelaPago = (id) => {
    setParcelas(parcelas.map(p => {
      if (p.id === id) {
        const pagamentosAtuais = Array.isArray(p.pagamentos) ? p.pagamentos : [];
        const jaPago = pagamentosAtuais.includes(mesChaveAtual);
        const novosPagamentos = jaPago 
          ? pagamentosAtuais.filter(m => m !== mesChaveAtual)
          : [...pagamentosAtuais, mesChaveAtual];
        return { ...p, pagamentos: novosPagamentos };
      }
      return p;
    }));
  };

  const deletarFixa = (id) => setFixas(fixas.filter(f => f.id !== id));
  const deletarParcela = (id) => setParcelas(parcelas.filter(p => p.id !== id));
  const deletarRenda = (id) => setRendas(rendas.filter(r => r.id !== id));

  const adicionarRenda = (e) => {
    e.preventDefault();
    if (!novaRenda.titulo || !novaRenda.valor) return;
    const item = {
      id: Date.now(),
      titulo: novaRenda.titulo,
      descricao: novaRenda.descricao || 'Tópico de Renda',
      valor: Number(novaRenda.valor),
      categoria: novaRenda.categoria
    };
    setRendas([...rendas, item]);
    setModalRendaAberta(false);
    setNovaRenda({ titulo: '', descricao: '', valor: '', categoria: 'garantida' });
  };

  const criarNovaCaixinha = (e) => {
    e.preventDefault();
    if (!novaCaixinha.titulo || !novaCaixinha.meta) return;
    const item = {
      id: Date.now(),
      titulo: novaCaixinha.titulo,
      sub: novaCaixinha.sub || 'Rendimento Variável',
      meta: Number(novaCaixinha.meta),
      acumulado: Number(novaCaixinha.acumulado) || 0,
      cor: novaCaixinha.cor,
      emoji: novaCaixinha.emoji
    };
    setCaixinhas([...caixinhas, item]);
    setModalCaixinhaAberta(false);
    setNovaCaixinha({ titulo: '', sub: '', meta: '', acumulado: '0', cor: '#a855f7', emoji: '🎯' });
  };

  const salvarEdicaoRenda = (e) => {
    e.preventDefault();
    if (!modalEditarRenda) return;
    setRendas(rendas.map(r => r.id === modalEditarRenda.id ? { ...modalEditarRenda, valor: Number(modalEditarRenda.valor) } : r));
    setModalEditarRenda(null);
  };

  const adicionarParcela = (e) => {
    e.preventDefault();
    if (!novaParcela.titulo || !novaParcela.valor) return;
    const item = {
      id: Date.now(),
      titulo: novaParcela.titulo,
      valor: Number(novaParcela.valor),
      vencimento: novaParcela.vencimento,
      parcelaatual: Number(novaParcela.parcelaatual),
      totalparcelas: Number(novaParcela.totalparcelas),
      tag: novaParcela.tag,
      mesInicio: novaParcela.mesInicio,
      pagamentos: []
    };
    setParcelas([...parcelas, item]);
    setModalParcelaAberta(false);
    setNovaParcela({ titulo: '', valor: '', vencimento: '10', parcelaatual: 1, totalparcelas: 1, tag: 'Geral', mesInicio: mesFormatadoIso });
  };

  const adicionarFixa = (e) => {
    e.preventDefault();
    if (!novaFixa.titulo || !novaFixa.valor) return;
    const item = {
      id: Date.now(),
      titulo: novaFixa.titulo,
      valor: Number(novaFixa.valor),
      vencimento: novaFixa.vencimento || '10',
      tag: novaFixa.tag,
      pagamentos: []
    };
    setFixas([...fixas, item]);
    setModalFixaAberta(false);
    setNovaFixa({ titulo: '', valor: '', vencimento: '10', tag: 'Serviços' });
  };

  const executarOperacaoCaixinha = (e) => {
    e.preventDefault();
    if (!modalOperacaoCaixinha || !valorOperacaoCaixinha) return;
    const val = Number(valorOperacaoCaixinha);
    setCaixinhas(caixinhas.map(c => {
      if (c.id === modalOperacaoCaixinha.item.id) {
        const novoValor = modalOperacaoCaixinha.tipo === 'guardar' ? c.acumulado + val : Math.max(0, c.acumulado - val);
        return { ...c, acumulado: novoValor };
      }
      return c;
    }));
    setModalOperacaoCaixinha(null);
    setValorOperacaoCaixinha('');
  };

  const GERAR_PDF_FORMAL = () => {
    window.print();
  };

  const formatarMoeda = (val) => {
    if (ocultarValores) return 'R$ •••••';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // --- TELA DE LOGIN ULTRA PREMIUM COM DEGRADÊ ROXO/ROSA NEON ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f1015] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-xs bg-[#171821] border border-purple-500/20 rounded-[32px] p-6 shadow-[0_0_50px_rgba(168,85,247,0.12)] text-center relative overflow-hidden backdrop-blur-xl">
          
          <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/20 border border-purple-400/30">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight mb-0.5 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
            Família Maia Finance
          </h1>
          <p className="text-gray-400 text-[11px] mb-6 font-medium">Gestão Financeira Privada</p>

          <div className="bg-[#101117] border border-purple-500/10 rounded-2xl p-3 mb-6 flex items-center space-x-3 text-left">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md">
              AG
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Alessandro e Giovanna</h3>
              <p className="text-[10px] text-purple-300/70">Perfil Privado</p>
            </div>
          </div>

          {/* INDICADORES DE SENHA (6 DÍGITOS ESTILO IPHONE ROXO NEON) */}
          <div className="mb-6">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Digite o PIN (6 dígitos)</span>
            <div className="flex justify-center space-x-3">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                    i < senhaDigitada.length 
                      ? 'bg-purple-400 border-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.9)] scale-110' 
                      : 'bg-[#101117] border-gray-700/80'
                  }`}
                ></div>
              ))}
            </div>
            {erroLogin && <p className="text-rose-400 text-xs mt-3 font-medium">{erroLogin}</p>}
          </div>

          {/* TECLADO NUMÉRICO CIRCULAR ESTILO IPHONE */}
          <div className="grid grid-cols-3 gap-3 px-1 mb-2 justify-items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitarNumero(String(num))}
                className="w-14 h-14 bg-[#20222e] hover:bg-purple-600/30 active:scale-95 rounded-full text-xl font-bold text-white transition flex items-center justify-center border border-purple-500/10 shadow hover:border-purple-500/40"
              >
                {num}
              </button>
            ))}
            <div className="w-14 h-14"></div>
            <button
              type="button"
              onClick={() => handleDigitarNumero('0')}
              className="w-14 h-14 bg-[#20222e] hover:bg-purple-600/30 active:scale-95 rounded-full text-xl font-bold text-white transition flex items-center justify-center border border-purple-500/10 shadow hover:border-purple-500/40"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleApagarNumero}
              className="w-14 h-14 bg-[#20222e]/50 hover:bg-rose-500/20 active:scale-95 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-400 transition"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[10px] text-gray-500 mt-4 font-mono">Família Maia • PWA</p>
        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL (DASHBOARD) ---
  return (
    <div className="min-h-screen bg-[#0f1015] text-white pb-32 font-sans">
      
      {/* HEADER SUPERIOR */}
      <header className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between border-b border-gray-800/60 mb-6 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center border border-purple-400/30 shadow-lg shadow-purple-500/10">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight">Família Maia Finance</h1>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse mr-1"></span>
              <button onClick={() => mudarMes(-1)} className="text-gray-400 hover:text-white p-0.5 transition">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-purple-200 font-semibold px-1">{mesFormatadoCapitalized}</span>
              <button onClick={() => mudarMes(1)} className="text-gray-400 hover:text-white p-0.5 transition">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {permissaoNotificacao !== 'granted' && (
            <button 
              onClick={solicitarPermissaoNotificacao}
              title="Ativar Notificações no Celular"
              className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-2xl hover:bg-purple-500/20 text-purple-300 transition"
            >
              <Bell className="w-4 h-4 animate-bounce" />
            </button>
          )}

          <button 
            onClick={() => setOcultarValores(!ocultarValores)}
            className="p-2.5 bg-[#171821] border border-gray-800 rounded-2xl hover:bg-gray-800 text-gray-300 transition"
          >
            {ocultarValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <div className="hidden sm:flex items-center space-x-2 bg-[#171821] border border-purple-500/20 px-3 py-1.5 rounded-2xl">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center">AG</div>
            <span className="text-xs font-medium text-gray-200">Alessandro e Giovanna</span>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="p-2.5 bg-[#171821] border border-gray-800 rounded-2xl hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DAS ABAS */}
      <main className="max-w-4xl mx-auto px-4 space-y-6">

        {/* --- ABA 1: RENDA --- */}
        {abaAtiva === 'renda' && (
          <div className="space-y-6 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#171821] border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase mb-1">RENDA TOTAL</p>
                  <p className="text-2xl font-black text-emerald-400">{formatarMoeda(rendaTotal)}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#171821] border border-rose-500/20 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[10px] font-bold text-rose-400 tracking-wider uppercase mb-1">DESPESAS + PARCELAS</p>
                  <p className="text-2xl font-black text-rose-400">{formatarMoeda(despesasAbertasTotal)}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#171821] border border-purple-500/20 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[10px] font-bold text-purple-300 tracking-wider uppercase mb-1">SALDO PROJETADO</p>
                  <p className="text-2xl font-black text-white">{formatarMoeda(saldoProjetado)}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-300 border border-purple-500/30">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-[#171821] border border-gray-800 rounded-2xl p-5 shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-300">Resumo Orçamentário Visual</span>
                <span className="text-xs font-bold text-purple-300">{pctComprometido}% Comprometido</span>
              </div>
              <div className="w-full h-2.5 bg-[#101117] rounded-full overflow-hidden flex p-0.5 border border-gray-800">
                <div style={{ width: `${Math.min(pctComprometido, 100)}%` }} className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                <span>Fixas: {formatarMoeda(fixasPagar)}</span>
                <span>Dívidas: {formatarMoeda(parcelasPagar)}</span>
              </div>
            </div>

            <div className="bg-[#171821] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-md">
              <div className="flex justify-between items-center border-b border-gray-800/80 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-none">Rendas & Entradas da Família</h2>
                  <p className="text-xs text-gray-400 mt-1">Gerencie salários, extras e crie novos tópicos de receita</p>
                </div>
                <button 
                  onClick={() => setModalRendaAberta(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center space-x-1 shadow-lg shadow-purple-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Tópico</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">1. RENDA FICHA GARANTIDA</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    Subtotal: {formatarMoeda(totalRendaGarantida)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rendas.filter(r => r.categoria === 'garantida').map(r => (
                    <div key={r.id} className="bg-[#101117] border border-gray-800/80 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">{r.titulo}</p>
                        <p className="font-bold text-sm text-white">{r.descricao}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-emerald-400 text-sm">{formatarMoeda(r.valor)}</span>
                        <button onClick={() => setModalEditarRenda(r)} className="text-gray-500 hover:text-white p-1">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deletarRenda(r.id)} className="text-gray-600 hover:text-rose-400 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">+ 2. RENDAS EXTRAS / VARIÁVEIS</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-xl border border-purple-500/20">
                    Subtotal: {formatarMoeda(totalRendaExtra)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {rendas.filter(r => r.categoria === 'extra').map(r => (
                    <div key={r.id} className="bg-[#101117] border border-gray-800/80 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-white">{r.titulo}</p>
                        <p className="text-xs text-gray-500">{r.descricao}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-purple-300 text-sm">{formatarMoeda(r.valor)}</span>
                        <button onClick={() => setModalEditarRenda(r)} className="text-gray-500 hover:text-white p-1">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deletarRenda(r.id)} className="text-gray-600 hover:text-rose-400 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA 2: FIXAS --- */}
        {abaAtiva === 'fixas' && (
          <div className="bg-[#171821] border border-gray-800 rounded-2xl p-6 space-y-6 print:hidden shadow-md">
            <div className="flex justify-between items-center border-b border-gray-800/80 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-none">Despesas Fixas Intocáveis</h2>
                <p className="text-xs text-gray-400 mt-1">Contas recorrentes do mês (Marque o check quando pagar)</p>
              </div>
              <button 
                onClick={() => setModalFixaAberta(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center space-x-1 shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="space-y-3">
              {fixasAtivasNoMes.map(item => {
                const alerta = calcularAlertaVencimento(item.vencimento, item.pagoNoMes);
                return (
                  <div 
                    key={item.id} 
                    className={`bg-[#101117] border rounded-2xl p-4 flex items-center justify-between transition ${
                      item.pagoNoMes ? 'border-emerald-500/20 opacity-50' : 'border-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button onClick={() => toggleFixaPago(item.id)} className="text-gray-400 hover:text-emerald-400">
                        {item.pagoNoMes ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5" />}
                      </button>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className={`font-semibold text-sm ${item.pagoNoMes ? 'line-through text-gray-500' : 'text-white'}`}>
                            {item.titulo}
                          </p>
                          <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-md">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Vencimento: Dia {item.vencimento}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {alerta && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center space-x-1 ${
                          alerta.urgente 
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' 
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}>
                          <AlertCircle className="w-3 h-3" />
                          <span>{alerta.texto}</span>
                        </span>
                      )}

                      <span className={`font-bold text-sm ${item.pagoNoMes ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {formatarMoeda(item.valor)}
                      </span>
                      <button onClick={() => deletarFixa(item.id)} className="text-gray-600 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400">Total Fixas A Pagar ({mesFormatadoCapitalized}):</span>
              <span className="text-lg font-black text-white">{formatarMoeda(fixasPagar)}</span>
            </div>
          </div>
        )}

        {/* --- ABA 3: DÍVIDAS / PARCELAS --- */}
        {abaAtiva === 'dividas' && (
          <div className="bg-[#171821] border border-gray-800 rounded-2xl p-6 space-y-6 print:hidden shadow-md">
            <div className="flex justify-between items-center border-b border-gray-800/80 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-none">Parcelas Ativas em {mesFormatadoCapitalized}</h2>
                <p className="text-xs text-gray-400 mt-1">Dívidas e parcelamentos vigentes (Marque o check ao quitar)</p>
              </div>
              <button 
                onClick={() => setModalParcelaAberta(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center space-x-1 shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Parcela</span>
              </button>
            </div>

            <div className="space-y-3">
              {parcelasAtivasNoMes.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">Nenhuma parcela ativa cadastrada para este mês.</p>
              ) : (
                parcelasAtivasNoMes.map(p => {
                  const alerta = calcularAlertaVencimento(p.vencimento, p.pagoNoMes);
                  return (
                    <div 
                      key={p.id} 
                      className={`bg-[#101117] border rounded-2xl p-4 flex items-center justify-between transition ${
                        p.pagoNoMes ? 'border-emerald-500/20 opacity-50' : 'border-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button onClick={() => toggleParcelaPago(p.id)} className="text-gray-400 hover:text-emerald-400">
                          {p.pagoNoMes ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5" />}
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className={`font-semibold text-sm ${p.pagoNoMes ? 'line-through text-gray-500' : 'text-white'}`}>
                              {p.titulo}
                            </p>
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                              {p.tag}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Parcela: {p.parcelaExibida || p.parcelaatual}/{p.totalparcelas} • Vencimento: Dia {p.vencimento}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {alerta && (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center space-x-1 ${
                            alerta.urgente 
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' 
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}>
                            <AlertCircle className="w-3 h-3" />
                            <span>{alerta.texto}</span>
                          </span>
                        )}

                        <span className={`font-bold text-sm ${p.pagoNoMes ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {formatarMoeda(p.valor)}
                        </span>
                        <button onClick={() => deletarParcela(p.id)} className="text-gray-600 hover:text-rose-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400">Total Dívidas Restantes ({mesFormatadoCapitalized}):</span>
              <span className="text-lg font-black text-rose-400">{formatarMoeda(parcelasPagar)}</span>
            </div>
          </div>
        )}

        {/* --- ABA 4: CAIXINHAS --- */}
        {abaAtiva === 'caixinhas' && (
          <div className="print:hidden">
            {!caixinhaDesbloqueada ? (
              <div className="bg-[#171821] border border-purple-500/20 rounded-3xl p-8 max-w-md mx-auto text-center space-y-6 shadow-2xl">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30 text-purple-400">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Cofre de Investimentos</h2>
                  <p className="text-xs text-gray-400 mt-1">Digite o PIN privado de 4 dígitos para gerenciar o cofre</p>
                </div>

                <form onSubmit={handleAcessarCaixinha} className="space-y-4">
                  <input 
                    type="password" 
                    maxLength={4}
                    placeholder="PIN..."
                    value={pinCaixinha}
                    onChange={(e) => setPinCaixinha(e.target.value)}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl px-4 py-3 text-center text-xl font-bold tracking-widest text-white focus:outline-none focus:border-purple-500"
                  />
                  {erroPin && <p className="text-rose-400 text-xs">{erroPin}</p>}
                  <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-purple-500/20">
                    Confirmar Acesso Privado
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#171821] border border-gray-800 rounded-3xl p-6 space-y-6 shadow-xl">
                  {/* HEADER DO COFRE */}
                  <div className="flex justify-between items-center border-b border-gray-800/80 pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-white">Cofre & Investimentos</h2>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Rendimento Ativo</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Gestão de patrimônio, CDI e proteções contra inflação</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setModalCaixinhaAberta(true)}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-500/20 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Caixinha</span>
                      </button>

                      <button 
                        onClick={() => { setCaixinhaDesbloqueada(false); setPinCaixinha(''); }}
                        title="Bloquear Cofre"
                        className="p-2.5 bg-[#101117] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 rounded-2xl transition"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* CARDS RESUMO SUPERIOR */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#101117] border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL ACUMULADO</p>
                        <p className="text-xl font-black text-emerald-400 mt-0.5">{formatarMoeda(totalAcumuladoCaixinhas)}</p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Shield className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-[#101117] border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">FALTANTE META GLOBAL</p>
                        <p className="text-xl font-black text-amber-400 mt-0.5">{formatarMoeda(metaGlobalCaixinhas - totalAcumuladoCaixinhas)}</p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Target className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-[#101117] border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CONCLUSÃO GLOBAL</p>
                        <p className="text-xl font-black text-purple-300 mt-0.5">
                          {metaGlobalCaixinhas > 0 ? ((totalAcumuladoCaixinhas / metaGlobalCaixinhas) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
                        <Percent className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-xs text-gray-300 font-bold tracking-wider uppercase">
                      <span>ALOCAÇÃO DAS METAS DO COFRE</span>
                      <span className="text-gray-400 text-[11px] font-normal">Meta Global: {formatarMoeda(metaGlobalCaixinhas)}</span>
                    </div>

                    <div className="w-full h-3 bg-[#101117] rounded-full overflow-hidden p-0.5 border border-gray-800">
                      <div 
                        style={{ width: `${metaGlobalCaixinhas > 0 ? (totalAcumuladoCaixinhas / metaGlobalCaixinhas) * 100 : 0}%` }} 
                        className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      ></div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {caixinhas.map(c => (
                        <div key={c.id} className="bg-[#101117] border border-gray-800 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-[11px] font-medium text-gray-300">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.cor }}></span>
                          <span>{c.titulo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* GRID CARDS DAS CAIXINHAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caixinhas.map(c => {
                    const pct = c.meta > 0 ? Math.min(((c.acumulado / c.meta) * 100), 100).toFixed(0) : 0;
                    return (
                      <div key={c.id} className="bg-[#171821] border border-gray-800 rounded-3xl p-5 space-y-4 shadow-lg relative overflow-hidden">
                        <div className="flex items-start justify-between relative z-10">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow border border-white/10" style={{ backgroundColor: c.cor }}>
                              {c.emoji}
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-white">{c.titulo}</h3>
                              <p className="text-xs text-gray-400">{c.sub}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-200 bg-[#101117] border border-gray-800 px-2.5 py-1 rounded-xl">
                            {pct}%
                          </span>
                        </div>

                        <div className="space-y-1.5 relative z-10">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Acumulado: <strong className="text-white font-bold">{formatarMoeda(c.acumulado)}</strong></span>
                            <span>Meta: <strong className="text-white font-bold">{formatarMoeda(c.meta)}</strong></span>
                          </div>

                          <div className="w-full h-2 bg-[#101117] rounded-full overflow-hidden border border-gray-800">
                            <div style={{ width: `${pct}%`, backgroundColor: c.cor }} className="h-full rounded-full transition-all duration-500"></div>
                          </div>

                          <p className="text-[10px] text-gray-400 text-right">
                            Faltam <strong className="text-amber-400">{formatarMoeda(c.meta - c.acumulado)}</strong>
                          </p>
                        </div>

                        <div className="flex space-x-2 pt-1 relative z-10">
                          <button 
                            onClick={() => setModalOperacaoCaixinha({ item: c, tipo: 'guardar' })}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 shadow-lg shadow-purple-500/20 transition"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>+ Guardar</span>
                          </button>
                          <button 
                            onClick={() => setModalOperacaoCaixinha({ item: c, tipo: 'retirar' })}
                            className="flex-1 bg-[#101117] hover:bg-gray-800 text-gray-200 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1 border border-gray-800 transition"
                          >
                            <MinusCircle className="w-4 h-4" />
                            <span>Retirar</span>
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

        {/* --- ABA 5: RELATÓRIO DE SAÚDE FINANCEIRA + PDF FORMAL --- */}
        {abaAtiva === 'relatorio' && (
          <div className="space-y-6">
            
            <div className="bg-[#171821] border border-gray-800 rounded-2xl p-6 space-y-6 print:hidden shadow-md">
              <div className="flex justify-between items-center border-b border-gray-800/80 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-none">Relatório de Saúde Financeira ({mesFormatadoCapitalized})</h2>
                  <p className="text-xs text-gray-400 mt-1">Visão consolidada do orçamento e percentual de gasto</p>
                </div>
                <button 
                  onClick={GERAR_PDF_FORMAL}
                  className="bg-white hover:bg-gray-200 text-black font-bold px-4 py-2 rounded-2xl text-xs flex items-center space-x-1.5 shadow transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Gerar PDF Formal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex justify-center py-4">
                  <div className="relative w-48 h-48 rounded-full border-8 border-[#101117] flex items-center justify-center border-t-purple-500 border-r-indigo-500 shadow-2xl">
                    <div className="text-center">
                      <span className="text-3xl font-black text-white">{pctComprometido}%</span>
                      <p className="text-[10px] text-purple-300 uppercase font-bold tracking-wider mt-0.5">Comprometido</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-[#101117] border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-300">Renda Bruta Total</span>
                    <span className="font-bold text-emerald-400">{formatarMoeda(rendaTotal)}</span>
                  </div>
                  <div className="bg-[#101117] border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-300">Comprometimento Mensal</span>
                    <span className="font-bold text-rose-400">{formatarMoeda(despesasAbertasTotal)}</span>
                  </div>
                  <div className="bg-[#101117] border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-300">Sobra para Reserva</span>
                    <span className="font-bold text-purple-300">{formatarMoeda(saldoProjetado)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DOCUMENTO IMPRESSO/PDF FORMAL */}
            <div className="hidden print:block text-black p-8 max-w-2xl mx-auto space-y-6">
              <div className="border-b-2 border-black pb-4 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black uppercase">Família Maia Finance</h1>
                  <p className="text-xs font-semibold text-gray-600">Relatório Executivo de Saúde Financeira • {mesFormatadoCapitalized}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Titulares: Alessandro & Giovanna</p>
                  <p>Data de emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm uppercase tracking-wider border-b border-gray-300 pb-1">1. Resumo Executivo</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-medium">Renda Bruta Total</td>
                      <td className="py-2 text-right font-bold text-black">{formatarMoeda(rendaTotal)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-medium">Total de Despesas Fixas (A Pagar)</td>
                      <td className="py-2 text-right font-bold text-gray-800">{formatarMoeda(fixasPagar)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-medium">Total de Dívidas / Parcelas do Mês</td>
                      <td className="py-2 text-right font-bold text-rose-700">{formatarMoeda(parcelasPagar)}</td>
                    </tr>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <td className="py-2 font-bold">Comprometimento Total Orçamentário</td>
                      <td className="py-2 text-right font-black">{pctComprometido}%</td>
                    </tr>
                    <tr className="border-b-2 border-black bg-gray-100">
                      <td className="py-2.5 font-bold">Saldo Livre Projetado / Reserva</td>
                      <td className="py-2.5 text-right font-black text-lg">{formatarMoeda(saldoProjetado)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm uppercase tracking-wider border-b border-gray-300 pb-1">2. Detalhamento de Fontes de Renda</h3>
                <ul className="text-xs space-y-1">
                  {rendas.map(r => (
                    <li key={r.id} className="flex justify-between border-b border-gray-100 py-1">
                      <span>{r.titulo} ({r.descricao})</span>
                      <span className="font-bold">{formatarMoeda(r.valor)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 text-center text-[10px] text-gray-500 border-t border-gray-200">
                Documento Gerado Automaticamente pelo Sistema Privado Família Maia Finance
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL CRIAR NOVA CAIXINHA */}
      {modalCaixinhaAberta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171821] border border-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Criar Nova Caixinha / Cofre</h3>
              <button onClick={() => setModalCaixinhaAberta(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={criarNovaCaixinha} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Título do Objetivo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Viagem de Fim de Ano, Trocar de Carro..."
                  value={novaCaixinha.titulo}
                  onChange={(e) => setNovaCaixinha({ ...novaCaixinha, titulo: e.target.value })}
                  className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Estratégia / Rendimento</label>
                <input 
                  type="text" 
                  placeholder="Ex: CDB 100% CDI, Tesouro Selic..."
                  value={novaCaixinha.sub}
                  onChange={(e) => setNovaCaixinha({ ...novaCaixinha, sub: e.target.value })}
                  className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Meta Financeira (R$)</label>
                  <input 
                    type="number" 
                    placeholder="5000"
                    value={novaCaixinha.meta}
                    onChange={(e) => setNovaCaixinha({ ...novaCaixinha, meta: e.target.value })}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Emoji / Ícone</label>
                  <input 
                    type="text" 
                    value={novaCaixinha.emoji}
                    onChange={(e) => setNovaCaixinha({ ...novaCaixinha, emoji: e.target.value })}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500 text-center"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalCaixinhaAberta(false)}
                  className="w-1/2 bg-[#101117] hover:bg-gray-800 text-white py-3 rounded-2xl font-semibold text-xs border border-gray-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-2xl text-xs shadow-lg shadow-purple-500/20"
                >
                  Criar Caixinha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL OPERAÇÃO CAIXINHA (GUARDAR / RETIRAR) */}
      {modalOperacaoCaixinha && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171821] border border-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {modalOperacaoCaixinha.tipo === 'guardar' ? 'Guardar em' : 'Retirar de'}: {modalOperacaoCaixinha.item.titulo}
              </h3>
              <button onClick={() => setModalOperacaoCaixinha(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={executarOperacaoCaixinha} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Valor (R$)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={valorOperacaoCaixinha}
                  onChange={(e) => setValorOperacaoCaixinha(e.target.value)}
                  className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500 text-white"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalOperacaoCaixinha(null)}
                  className="w-1/2 bg-[#101117] hover:bg-gray-800 text-white py-3 rounded-2xl font-semibold text-xs border border-gray-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`w-1/2 font-bold text-xs py-3 rounded-2xl shadow-lg ${
                    modalOperacaoCaixinha.tipo === 'guardar' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/20' : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR RENDA */}
      {modalRendaAberta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171821] border border-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Adicionar Novo Tópico de Renda</h3>
              <button onClick={() => setModalRendaAberta(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={adicionarRenda} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Título / Pessoa</label>
                <input 
                  type="text" 
                  placeholder="Ex: Alessandro, Giovanna, Extra..."
                  value={novaRenda.titulo}
                  onChange={(e) => setNovaRenda({ ...novaRenda, titulo: e.target.value })}
                  className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Salário Fixo, Vendas, Motoboy..."
                  value={novaRenda.descricao}
                  onChange={(e) => setNovaRenda({ ...novaRenda, descricao: e.target.value })}
                  className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={novaRenda.valor}
                    onChange={(e) => setNovaRenda({ ...novaRenda, valor: e.target.value })}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Categoria</label>
                  <select 
                    value={novaRenda.categoria}
                    onChange={(e) => setNovaRenda({ ...novaRenda, categoria: e.target.value })}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500 text-white"
                  >
                    <option value="garantida">1. Ficha Garantida</option>
                    <option value="extra">2. Renda Extra</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalRendaAberta(false)}
                  className="w-1/2 bg-[#101117] hover:bg-gray-800 text-white py-3 rounded-2xl font-semibold text-xs border border-gray-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-2xl text-xs shadow-lg shadow-purple-500/20"
                >
                  Adicionar Tópico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR RENDA */}
      {modalEditarRenda && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171821] border border-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Editar Renda: {modalEditarRenda.titulo}</h3>
              <button onClick={() => setModalEditarRenda(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={salvarEdicaoRenda} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Título</label>
                <input 
                  type="text" 
                  value={modalEditarRenda.titulo}
                  onChange={(e) => setModalEditarRenda({ ...modalEditarRenda, titulo: e.target.value })}
                  className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Novo Valor (R$)</label>
                <input 
                  type="number" 
                  value={modalEditarRenda.valor}
                  onChange={(e) => setModalEditarRenda({ ...modalEditarRenda, valor: e.target.value })}
                  className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalEditarRenda(null)}
                  className="w-1/2 bg-[#101117] hover:bg-gray-800 text-white py-3 rounded-2xl font-semibold text-xs border border-gray-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-2xl text-xs shadow-lg shadow-purple-500/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR PARCELA */}
      {modalParcelaAberta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171821] border border-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Adicionar Nova Parcela</h3>
            <form onSubmit={adicionarParcela} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Tênis, Empréstimo..."
                  value={novaParcela.titulo}
                  onChange={(e) => setNovaParcela({ ...novaParcela, titulo: e.target.value })}
                  className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Valor da Parcela (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={novaParcela.valor}
                    onChange={(e) => setNovaParcela({ ...novaParcela, valor: e.target.value })}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Dia Vencimento</label>
                  <input 
                    type="number" 
                    value={novaParcela.vencimento}
                    onChange={(e) => setNovaParcela({ ...novaParcela, vencimento: e.target.value })}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Parcela Atual</label>
                  <input 
                    type="number" 
                    value={novaParcela.parcelaatual}
                    onChange={(e) => setNovaParcela({ ...novaParcela, parcelaatual: e.target.value })}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Total de Parcelas</label>
                  <input 
                    type="number" 
                    value={novaParcela.totalparcelas}
                    onChange={(e) => setNovaParcela({ ...novaParcela, totalparcelas: e.target.value })}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Mês de Início (1ª Parcela)</label>
                <input 
                  type="month" 
                  value={novaParcela.mesInicio}
                  onChange={(e) => setNovaParcela({ ...novaParcela, mesInicio: e.target.value })}
                  className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalParcelaAberta(false)}
                  className="w-1/2 bg-[#101117] hover:bg-gray-800 text-white py-3 rounded-2xl font-semibold text-xs border border-gray-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-2xl text-xs shadow-lg shadow-purple-500/20"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR FIXA */}
      {modalFixaAberta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171821] border border-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Adicionar Despesa Fixa</h3>
            <form onSubmit={adicionarFixa} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Título da Conta</label>
                <input 
                  type="text" 
                  placeholder="Ex: Internet, Luz..."
                  value={novaFixa.titulo}
                  onChange={(e) => setNovaFixa({ ...novaFixa, titulo: e.target.value })}
                  className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={novaFixa.valor}
                    onChange={(e) => setNovaFixa({ ...novaFixa, valor: e.target.value })}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Dia Vencimento</label>
                  <input 
                    type="number" 
                    value={novaFixa.vencimento}
                    onChange={(e) => setNovaFixa({ ...novaFixa, vencimento: e.target.value })}
                    className="w-full bg-[#101117] border border-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalFixaAberta(false)}
                  className="w-1/2 bg-[#101117] hover:bg-gray-800 text-white py-3 rounded-2xl font-semibold text-xs border border-gray-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-2xl text-xs shadow-lg shadow-purple-500/20"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <div className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-center pointer-events-none z-40 print:hidden">
        <nav className="pointer-events-auto bg-[#171821]/95 backdrop-blur-md border border-purple-500/20 rounded-3xl p-1.5 flex justify-between items-center w-full max-w-md shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          <button 
            onClick={() => setAbaAtiva('renda')}
            className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-2xl transition ${
              abaAtiva === 'renda' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Renda</span>
          </button>

          <button 
            onClick={() => setAbaAtiva('fixas')}
            className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-2xl transition ${
              abaAtiva === 'fixas' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Fixas</span>
          </button>

          <button 
            onClick={() => setAbaAtiva('dividas')}
            className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-2xl transition ${
              abaAtiva === 'dividas' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Dívidas</span>
          </button>

          <button 
            onClick={() => setAbaAtiva('caixinhas')}
            className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-2xl transition ${
              abaAtiva === 'caixinhas' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Caixinhas</span>
          </button>

          <button 
            onClick={() => setAbaAtiva('relatorio')}
            className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-2xl transition ${
              abaAtiva === 'relatorio' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Relatório</span>
          </button>
        </nav>
      </div>

    </div>
  );
}