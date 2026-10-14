import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, Calendar, CreditCard, Shield, PieChart, Lock, Eye, EyeOff, 
  Plus, Trash2, CheckSquare, Square, LogOut, FileText, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function App() {
  // --- AUTENTICAÇÃO ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputSenha, setInputSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  // --- NAVEGAÇÃO & UI ---
  const [abaAtiva, setAbaAtiva] = useState('renda'); // renda, fixas, dividas, caixinhas, relatorio
  const [ocultarValores, setOcultarValores] = useState(false);
  const [mesAtual, setMesAtual] = useState('2026-10');

  // --- CAIXINHA PROTEGIDA ---
  const [pinCaixinha, setPinCaixinha] = useState('');
  const [caixinhaDesbloqueada, setCaixinhaDesbloqueada] = useState(false);
  const [erroPin, setErroPin] = useState('');

  // --- MODAIS ---
  const [modalParcelaAberta, setModalParcelaAberta] = useState(false);
  const [modalFixaAberta, setModalFixaAberta] = useState(false);
  const [modalCaixinhaAberta, setModalCaixinhaAberta] = useState(false);

  // --- ESTADOS DE DADOS FINANCEIROS ---
  const [rendas, setRendas] = useState([
    { id: 1, categoria: 'garantida', titulo: 'Alessandro (Wlinks)', descricao: 'Salário Fixo', valor: 1180 },
    { id: 2, categoria: 'garantida', titulo: 'Giovanna', descricao: 'Salário Fixo', valor: 1650 },
    { id: 3, categoria: 'garantida', titulo: 'Academia', descricao: 'Faxina Aos Sábados', valor: 840 },
    { id: 4, categoria: 'extra', titulo: 'Renda Extra (Esposa)', descricao: 'Trabalhos adicionais', valor: 490 },
    { id: 5, categoria: 'extra', titulo: 'Premiação / Meta Trabalho', descricao: 'Estimado (Pode variar)', valor: 300 },
    { id: 6, categoria: 'extra', titulo: 'Entrega Motoboy', descricao: 'Extra / Variável', valor: 350 },
  ]);

  const [fixas, setFixas] = useState([
    { id: 1, titulo: 'Internet Fibra (Sua parte)', tag: 'Serviços', valor: 75, pago: false },
    { id: 2, titulo: 'Plano Celular Casal', tag: 'Comunicação', valor: 100, pago: false },
    { id: 3, titulo: 'Gasolina Moto', tag: 'Transporte', valor: 50, pago: false },
    { id: 4, titulo: 'Cuidado das Crianças (Pai)', tag: 'Família', valor: 150, pago: false },
  ]);

  const [parcelas, setParcelas] = useState([
    { id: 1, titulo: 'Cartão da Tia (Fatura Principal)', tag: 'Cartão Principal', valor: 2052, parcelaatual: 1, totalparcelas: 99, vencimento: '10', mesInicio: '2026-10', pago: false },
    { id: 2, titulo: 'Dívida Primo #1', tag: 'Empréstimo', valor: 121, parcelaatual: 8, totalparcelas: 10, vencimento: '05', mesInicio: '2026-03', pago: false },
    { id: 3, titulo: 'Dívida Primo #2', tag: 'Empréstimo', valor: 211, parcelaatual: 5, totalparcelas: 10, vencimento: '05', mesInicio: '2026-06', pago: false },
    { id: 4, titulo: 'Dívida Primo #3', tag: 'Empréstimo', valor: 107, parcelaatual: 3, totalparcelas: 6, vencimento: '05', mesInicio: '2026-08', pago: false },
    { id: 5, titulo: 'Cabelo alessandro', tag: 'Geral', valor: 85, parcelaatual: 1, totalparcelas: 1, vencimento: '10', mesInicio: '2026-10', pago: false },
    { id: 6, titulo: 'pneu', tag: 'Geral', valor: 140, parcelaatual: 1, totalparcelas: 1, vencimento: '10', mesInicio: '2026-10', pago: false },
  ]);

  const [caixinhas, setCaixinhas] = useState([
    { id: 1, titulo: 'Reserva de Emergência', sub: 'CDB 100% CDI (Liquidez Diária)', acumulado: 0, meta: 1000, cor: '#10b981' },
    { id: 2, titulo: 'Festa de 1 Aninho', sub: 'Rendimento Fixo Diário', acumulado: 0, meta: 4000, cor: '#ec4899' },
    { id: 3, titulo: 'Casamento & Viagem', sub: 'Tesouro Selic (Pós-fixado)', acumulado: 0, meta: 45000, cor: '#f59e0b' },
    { id: 4, titulo: 'Obra da Casa (Laje e Muro)', sub: 'IPCA+ (Proteção Inflação)', acumulado: 0, meta: 75000, cor: '#3b82f6' },
  ]);

  // --- FORMULÁRIOS DE NOVOS ITENS ---
  const [novaParcela, setNovaParcela] = useState({ titulo: '', valor: '', vencimento: '10', parcelaatual: 1, totalparcelas: 1, tag: 'Geral', mesInicio: mesAtual });
  const [novaFixa, setNovaFixa] = useState({ titulo: '', valor: '', tag: 'Serviços' });

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

  // --- LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (inputSenha === '23510360') {
      setIsAuthenticated(true);
      setErroLogin('');
    } else {
      setErroLogin('Senha incorreta!');
    }
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

  // --- CÁLCULOS DINÂMICOS ---
  const totalRendaGarantida = rendas.filter(r => r.categoria === 'garantida').reduce((acc, r) => acc + Number(r.valor), 0);
  const totalRendaExtra = rendas.filter(r => r.categoria === 'extra').reduce((acc, r) => acc + Number(r.valor), 0);
  const rendaTotal = totalRendaGarantida + totalRendaExtra;

  // Filtra itens do mês selecionado
  const fixasPagar = fixas.filter(f => !f.pago).reduce((acc, f) => acc + Number(f.valor), 0);
  const totalFixasBruto = fixas.reduce((acc, f) => acc + Number(f.valor), 0);

  const parcelasPagar = parcelas.filter(p => !p.pago).reduce((acc, p) => acc + Number(p.valor), 0);
  const totalParcelasBruto = parcelas.reduce((acc, p) => acc + Number(p.valor), 0);

  const despesasAbertasTotal = fixasPagar + parcelasPagar;
  const despesasBrutasTotal = totalFixasBruto + totalParcelasBruto;
  const saldoProjetado = rendaTotal - despesasAbertasTotal;
  const pctComprometido = rendaTotal > 0 ? ((despesasBrutasTotal / rendaTotal) * 100).toFixed(1) : 0;

  const totalAcumuladoCaixinhas = caixinhas.reduce((acc, c) => acc + Number(c.acumulado), 0);
  const metaGlobalCaixinhas = caixinhas.reduce((acc, c) => acc + Number(c.meta), 0);

  // --- HANDLERS DE ALTERAÇÃO ---
  const toggleFixaPago = (id) => {
    setFixas(fixas.map(f => f.id === id ? { ...f, pago: !f.pago } : f));
  };

  const toggleParcelaPago = (id) => {
    setParcelas(parcelas.map(p => p.id === id ? { ...p, pago: !p.pago } : p));
  };

  const deletarFixa = (id) => setFixas(fixas.filter(f => f.id !== id));
  const deletarParcela = (id) => setParcelas(parcelas.filter(p => p.id !== id));

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
      pago: false
    };
    setParcelas([...parcelas, item]);
    setModalParcelaAberta(false);
    setNovaParcela({ titulo: '', valor: '', vencimento: '10', parcelaatual: 1, totalparcelas: 1, tag: 'Geral', mesInicio: mesAtual });
  };

  const adicionarFixa = (e) => {
    e.preventDefault();
    if (!novaFixa.titulo || !novaFixa.valor) return;
    const item = {
      id: Date.now(),
      titulo: novaFixa.titulo,
      valor: Number(novaFixa.valor),
      tag: novaFixa.tag,
      pago: false
    };
    setFixas([...fixas, item]);
    setModalFixaAberta(false);
    setNovaFixa({ titulo: '', valor: '', tag: 'Serviços' });
  };

  const formatarMoeda = (val) => {
    if (ocultarValores) return 'R$ •••••';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // --- TELA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121316] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1e2025] border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Família Maia Finance</h1>
          <p className="text-gray-4 font-medium text-sm text-gray-400 mb-6">Gestão Financeira • Casal</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-[#121316] border border-gray-800 rounded-xl p-4 flex items-center justify-between text-left">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
                  AG
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Alessandro e Giovanna</h3>
                  <p className="text-xs text-gray-400">Perfil Único da Família</p>
                </div>
              </div>
            </div>

            <div className="text-left">
              <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1 block">Senha Privada</label>
              <input 
                type="password" 
                placeholder="Digite a senha..."
                value={inputSenha}
                onChange={(e) => setInputSenha(e.target.value)}
                className="w-full bg-[#121316] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
              {erroLogin && <p className="text-red-400 text-xs mt-1">{erroLogin}</p>}
            </div>

            <button type="submit" className="w-full bg-gray-200 hover:bg-white text-black font-semibold py-3 rounded-xl transition duration-200">
              Entrar no App
            </button>
          </form>
          <p className="text-xs text-gray-600 mt-6">Sistema Privado Família Maia</p>
        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL (DASHBOARD) ---
  return (
    <div className="min-h-screen bg-[#121316] text-white pb-28 font-sans">
      
      {/* HEADER SUPERIOR */}
      <header className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#1e2025] rounded-xl flex items-center justify-center border border-gray-800">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Família Maia Finance</h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <input 
                type="month" 
                value={mesAtual} 
                onChange={(e) => setMesAtual(e.target.value)}
                className="bg-transparent text-xs text-gray-300 font-medium focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setOcultarValores(!ocultarValores)}
            className="p-2.5 bg-[#1e2025] border border-gray-800 rounded-xl hover:bg-gray-800 text-gray-300"
          >
            {ocultarValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <div className="flex items-center space-x-2 bg-[#1e2025] border border-gray-800 px-3 py-1.5 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-xs font-bold flex items-center justify-center">AG</div>
            <span className="text-xs font-medium text-gray-200">Alessandro e Giovanna</span>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="p-2.5 bg-[#1e2025] border border-gray-800 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-gray-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DAS ABAS */}
      <main className="max-w-4xl mx-auto px-4 space-y-6">

        {/* --- ABA 1: RENDA --- */}
        {abaAtiva === 'renda' && (
          <div className="space-y-6">
            {/* CARDS DE RESUMO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Renda Total</p>
                  <p className="text-2xl font-black text-emerald-400">{formatarMoeda(rendaTotal)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Despesas + Parcelas</p>
                  <p className="text-2xl font-black text-rose-500">{formatarMoeda(despesasAbertasTotal)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Saldo Projetado</p>
                  <p className="text-2xl font-black text-white">{formatarMoeda(saldoProjetado)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-300">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* BARRA DE COMPROMETIMENTO */}
            <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-300">Resumo Orçamentário Visual</span>
                <span className="text-xs font-bold text-gray-400">{pctComprometido}% Comprometido</span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${Math.min(pctComprometido, 100)}%` }} className="bg-emerald-500 h-full"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Fixas: {formatarMoeda(fixasPagar)}</span>
                <span>Dívidas: {formatarMoeda(parcelasPagar)}</span>
              </div>
            </div>

            {/* SEÇÃO RENDAS */}
            <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold">Rendas & Entradas da Família</h2>
                <p className="text-xs text-gray-400">Gerencie salários, extras e crie novos tópicos de receita</p>
              </div>

              {/* 1. RENDA FICHA GARANTIDA */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">1. Renda Ficha Garantida</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    Subtotal: {formatarMoeda(totalRendaGarantida)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rendas.filter(r => r.categoria === 'garantida').map(r => (
                    <div key={r.id} className="bg-[#121316] border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">{r.titulo}</p>
                        <p className="font-bold text-sm">{r.descricao}</p>
                      </div>
                      <span className="font-bold text-emerald-400 text-sm">{formatarMoeda(r.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. RENDAS EXTRAS / VARIÁVEIS */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">+ 2. Rendas Extras / Variáveis</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg">
                    Subtotal: {formatarMoeda(totalRendaExtra)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {rendas.filter(r => r.categoria === 'extra').map(r => (
                    <div key={r.id} className="bg-[#121316] border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">{r.titulo}</p>
                        <p className="text-xs text-gray-500">{r.descricao}</p>
                      </div>
                      <span className="font-bold text-blue-400 text-sm">{formatarMoeda(r.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA 2: FIXAS --- */}
        {abaAtiva === 'fixas' && (
          <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">Despesas Fixas Intocáveis</h2>
                <p className="text-xs text-gray-400">Contas recorrentes do mês (Marque o check quando pagar)</p>
              </div>
              <button 
                onClick={() => setModalFixaAberta(true)}
                className="bg-white hover:bg-gray-200 text-black font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* LISTA DE FIXAS */}
            <div className="space-y-3">
              {fixas.map(item => (
                <div 
                  key={item.id} 
                  className={`bg-[#121316] border rounded-xl p-4 flex items-center justify-between transition ${
                    item.pago ? 'border-emerald-500/30 opacity-60' : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button onClick={() => toggleFixaPago(item.id)} className="text-gray-400 hover:text-emerald-400">
                      {item.pago ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5" />}
                    </button>
                    <div>
                      <p className={`font-semibold text-sm ${item.pago ? 'line-through text-gray-500' : 'text-white'}`}>
                        {item.titulo}
                      </p>
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`font-bold text-sm ${item.pago ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {formatarMoeda(item.valor)}
                    </span>
                    <button onClick={() => deletarFixa(item.id)} className="text-gray-600 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTAL DAS FIXAS COM DEDUÇÃO */}
            <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-400">Total Fixas A Pagar:</span>
              <span className="text-xl font-black text-white">{formatarMoeda(fixasPagar)}</span>
            </div>
          </div>
        )}

        {/* --- ABA 3: DÍVIDAS / PARCELAS --- */}
        {abaAtiva === 'dividas' && (
          <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">Parcelas Ativas em {mesAtual}</h2>
                <p className="text-xs text-gray-400">Dívidas e parcelamentos vigentes (Marque o check ao quitar)</p>
              </div>
              <button 
                onClick={() => setModalParcelaAberta(true)}
                className="bg-white hover:bg-gray-200 text-black font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Parcela</span>
              </button>
            </div>

            {/* LISTA DE PARCELAS */}
            <div className="space-y-3">
              {parcelas.map(p => (
                <div 
                  key={p.id} 
                  className={`bg-[#121316] border rounded-xl p-4 flex items-center justify-between transition ${
                    p.pago ? 'border-emerald-500/30 opacity-60' : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button onClick={() => toggleParcelaPago(p.id)} className="text-gray-400 hover:text-emerald-400">
                      {p.pago ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5" />}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className={`font-semibold text-sm ${p.pago ? 'line-through text-gray-500' : 'text-white'}`}>
                          {p.titulo}
                        </p>
                        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">
                          {p.tag}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Parcela: {p.parcelaatual}/{p.totalparcelas} • Vencimento: Dia {p.vencimento}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`font-bold text-sm ${p.pago ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {formatarMoeda(p.valor)}
                    </span>
                    <button onClick={() => deletarParcela(p.id)} className="text-gray-600 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTAL DAS DÍVIDAS COM DEDUÇÃO */}
            <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-400">Total Dívidas Restantes ({mesAtual}):</span>
              <span className="text-xl font-black text-rose-400">{formatarMoeda(parcelasPagar)}</span>
            </div>
          </div>
        )}

        {/* --- ABA 4: CAIXINHAS (PROTEGIDAS) --- */}
        {abaAtiva === 'caixinhas' && (
          <div>
            {!caixinhaDesbloqueada ? (
              <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-8 max-w-md mx-auto text-center space-y-6">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto border border-gray-700">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Cofre de Investimentos Família Maia</h2>
                  <p className="text-xs text-gray-400 mt-1">Digite o PIN privado de 4 dígitos para gerenciar seus investimentos</p>
                </div>

                <form onSubmit={handleAcessarCaixinha} className="space-y-4">
                  <input 
                    type="password" 
                    maxLength={4}
                    placeholder="PIN..."
                    value={pinCaixinha}
                    onChange={(e) => setPinCaixinha(e.target.value)}
                    className="w-full bg-[#121316] border border-gray-800 rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest text-white focus:outline-none focus:border-emerald-500"
                  />
                  {erroPin && <p className="text-red-400 text-xs">{erroPin}</p>}
                  <button type="submit" className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition">
                    Confirmar Acesso Privado
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* HEADBOARD DA CAIXINHA */}
                <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold">Cofre & Investimentos</h2>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                          Rendimento Ativo
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Gestão de patrimônio, CDI e proteções contra inflação</p>
                    </div>
                  </div>

                  {/* CARDS METAS GLOBAL */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#121316] border border-gray-800 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Total Acumulado</p>
                      <p className="text-xl font-black text-emerald-400 mt-1">{formatarMoeda(totalAcumuladoCaixinhas)}</p>
                    </div>
                    <div className="bg-[#121316] border border-gray-800 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Faltante para Meta Global</p>
                      <p className="text-xl font-black text-amber-400 mt-1">{formatarMoeda(metaGlobalCaixinhas - totalAcumuladoCaixinhas)}</p>
                    </div>
                    <div className="bg-[#121316] border border-gray-800 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Conclusão Global</p>
                      <p className="text-xl font-black text-white mt-1">
                        {metaGlobalCaixinhas > 0 ? ((totalAcumuladoCaixinhas / metaGlobalCaixinhas) * 100).toFixed(0) : 0}%
                      </p>
                    </div>
                  </div>

                  {/* PROGRESSO DE METAS */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 font-semibold">
                      <span>Alocação e Progresso das Metas do Cofre</span>
                      <span>Meta Global: {formatarMoeda(metaGlobalCaixinhas)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${metaGlobalCaixinhas > 0 ? (totalAcumuladoCaixinhas / metaGlobalCaixinhas) * 100 : 0}%` }} 
                        className="bg-emerald-500 h-full"
                      ></div>
                    </div>
                  </div>
                </div>

                {/* LISTA DAS CAIXINHAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caixinhas.map(c => {
                    const pct = c.meta > 0 ? Math.min(((c.acumulado / c.meta) * 100), 100).toFixed(0) : 0;
                    return (
                      <div key={c.id} className="bg-[#1e2025] border border-gray-800 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-base">{c.titulo}</h3>
                            <p className="text-xs text-gray-400">{c.sub}</p>
                          </div>
                          <span className="text-xs font-bold text-gray-300 bg-gray-800 px-2 py-1 rounded-lg">{pct}%</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Acumulado: <strong className="text-white">{formatarMoeda(c.acumulado)}</strong></span>
                            <span>Meta: <strong className="text-white">{formatarMoeda(c.meta)}</strong></span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div style={{ width: `${pct}%`, backgroundColor: c.cor }} className="h-full"></div>
                          </div>
                          <p className="text-[10px] text-gray-500 text-right">
                            Faltam {formatarMoeda(c.meta - c.acumulado)} para atingir a meta
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ABA 5: RELATÓRIO --- */}
        {abaAtiva === 'relatorio' && (
          <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Relatório de Saúde Financeira ({mesAtual})</h2>
                <p className="text-xs text-gray-400">Visão consolidada do orçamento e percentual de gasto</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* CÍRCULO VISUAL DE PORCENTAGEM */}
              <div className="flex justify-center">
                <div className="relative w-48 h-48 rounded-full border-8 border-gray-800 flex items-center justify-center border-t-emerald-500 border-r-emerald-500">
                  <div className="text-center">
                    <span className="text-3xl font-black">{pctComprometido}%</span>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Comprometido</p>
                  </div>
                </div>
              </div>

              {/* LISTA RESUMO */}
              <div className="space-y-3">
                <div className="bg-[#121316] border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-300">Renda Bruta Total</span>
                  <span className="font-bold text-emerald-400">{formatarMoeda(rendaTotal)}</span>
                </div>
                <div className="bg-[#121316] border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-300">Comprometimento Mensal</span>
                  <span className="font-bold text-rose-500">{formatarMoeda(despesasAbertasTotal)}</span>
                </div>
                <div className="bg-[#121316] border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-300">Sobra para Reserva</span>
                  <span className="font-bold text-white">{formatarMoeda(saldoProjetado)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL ADICIONAR PARCELA */}
      {modalParcelaAberta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Adicionar Nova Parcela</h3>
            <form onSubmit={adicionarParcela} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Tênis, Empréstimo..."
                  value={novaParcela.titulo}
                  onChange={(e) => setNovaParcela({ ...novaParcela, titulo: e.target.value })}
                  className="w-full bg-[#121316] border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-[#121316] border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Dia Vencimento</label>
                  <input 
                    type="number" 
                    value={novaParcela.vencimento}
                    onChange={(e) => setNovaParcela({ ...novaParcela, vencimento: e.target.value })}
                    className="w-full bg-[#121316] border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-[#121316] border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Total de Parcelas</label>
                  <input 
                    type="number" 
                    value={novaParcela.totalparcelas}
                    onChange={(e) => setNovaParcela({ ...novaParcela, totalparcelas: e.target.value })}
                    className="w-full bg-[#121316] border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Mês de Início (1ª Parcela)</label>
                <input 
                  type="month" 
                  value={novaParcela.mesInicio}
                  onChange={(e) => setNovaParcela({ ...novaParcela, mesInicio: e.target.value })}
                  className="w-full bg-[#121316] border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalParcelaAberta(false)}
                  className="w-1/2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-white hover:bg-gray-200 text-black py-3 rounded-xl font-semibold text-xs"
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
          <div className="bg-[#1e2025] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Adicionar Despesa Fixa</h3>
            <form onSubmit={adicionarFixa} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Título da Conta</label>
                <input 
                  type="text" 
                  placeholder="Ex: Internet, Luz..."
                  value={novaFixa.titulo}
                  onChange={(e) => setNovaFixa({ ...novaFixa, titulo: e.target.value })}
                  className="w-full bg-[#121316] border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Valor (R$)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={novaFixa.valor}
                  onChange={(e) => setNovaFixa({ ...novaFixa, valor: e.target.value })}
                  className="w-full bg-[#121316] border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalFixaAberta(false)}
                  className="w-1/2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-white hover:bg-gray-200 text-black py-3 rounded-xl font-semibold text-xs"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO INFERIOR (ESTILO PWA) */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1e2025]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-1.5 flex space-x-1 shadow-2xl z-40">
        <button 
          onClick={() => setAbaAtiva('renda')}
          className={`flex flex-col items-center px-4 py-2 rounded-xl transition ${
            abaAtiva === 'renda' ? 'bg-[#2a2d34] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-semibold">Renda</span>
        </button>

        <button 
          onClick={() => setAbaAtiva('fixas')}
          className={`flex flex-col items-center px-4 py-2 rounded-xl transition ${
            abaAtiva === 'fixas' ? 'bg-[#2a2d34] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-semibold">Fixas</span>
        </button>

        <button 
          onClick={() => setAbaAtiva('dividas')}
          className={`flex flex-col items-center px-4 py-2 rounded-xl transition ${
            abaAtiva === 'dividas' ? 'bg-[#2a2d34] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-semibold">Dívidas</span>
        </button>

        <button 
          onClick={() => setAbaAtiva('caixinhas')}
          className={`flex flex-col items-center px-4 py-2 rounded-xl transition ${
            abaAtiva === 'caixinhas' ? 'bg-[#2a2d34] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-semibold">Caixinhas</span>
        </button>

        <button 
          onClick={() => setAbaAtiva('relatorio')}
          className={`flex flex-col items-center px-4 py-2 rounded-xl transition ${
            abaAtiva === 'relatorio' ? 'bg-[#2a2d34] textgit add .-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <PieChart className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-semibold">Relatório</span>
        </button>
      </nav>

    </div>
  );
}