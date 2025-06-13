import { useState, useEffect } from 'react';
import './App.css';
import brasaoIvoti from './assets/brasao-ivoti.jpg';

// Tipos
type Porte = '' | 'MEI' | 'ME' | 'EPP' | 'Média' | 'Grande';
type RegimeTributario = '' | 'regimeGeral' | 'prestadorServico' | 'simplesNacional' | 'misto';

interface Pontuacao {
  empregos: number;
  porte: number;
  investimento: number;
  faturamento: number;
  desenvolvimento: number;
  total: number;
}

interface Incentivos {
  faixa: string;
  aluguel: string;
  obras: string;
  iptu: string;
  itbi: string;
  feiras: string;
  imoveis: string;
  limitacoes: string[];
}

interface ValoresTributarios {
  valorAdicionadoFiscal?: number;
  estimativaRepasseVAF?: number;
  receitaAnualTributavel?: number;
  estimativaReceitaLiquida?: number;
  receitaBrutaAcumulada?: number;
  receitaSujeitaICMS?: number;
  receitaSujeitaISSQN?: number;
  vafPresumido?: number;
  estimativaRepasseICMS?: number;
  estimativaReceitaLiquidaISSQN?: number;
  valorAdicionadoFiscalMisto?: number;
  receitaAnualTributavelMisto?: number;
  estimativaRepasseVAFMisto?: number;
  estimativaReceitaLiquidaMisto?: number;
  valorLimitanteIndustriaComercio?: number;
  valorLimitanteServicos?: number;
  valorLimitanteIncentivos?: number;
}

interface MembroComissao {
  nome: string;
  cargo: string;
}

function App() {
  const [cnpj, setCnpj] = useState<string>('');
  const [razaoSocial, setRazaoSocial] = useState<string>('');
  const [regimeTributario, setRegimeTributario] = useState<RegimeTributario>('');

  // Estados para valores formatados (exibição)
  const [valorAdicionadoFiscalFormatado, setValorAdicionadoFiscalFormatado] = useState<string>('');
  const [receitaAnualTributavelFormatada, setReceitaAnualTributavelFormatada] = useState<string>('');
  const [receitaBrutaAcumuladaFormatada, setReceitaBrutaAcumuladaFormatada] = useState<string>('');
  const [receitaSujeitaICMSFormatada, setReceitaSujeitaICMSFormatada] = useState<string>('');
  const [receitaSujeitaISSQNFormatada, setReceitaSujeitaISSQNFormatada] = useState<string>('');
  const [valorAdicionadoFiscalMistoFormatado, setValorAdicionadoFiscalMistoFormatado] = useState<string>('');
  const [receitaAnualTributavelMistoFormatada, setReceitaAnualTributavelMistoFormatada] = useState<string>('');

  const [valorInvestimentoFormatado, setValorInvestimentoFormatado] = useState<string>('');
  const [faturamentoAnualFormatado, setFaturamentoAnualFormatado] = useState<string>('');
  const [valoresTributarios, setValoresTributarios] = useState<ValoresTributarios>({});
  const [parecerComissao, setParecerComissao] = useState<string>('');
  const [membrosComissao, setMembrosComissao] = useState<MembroComissao[]>([
    { nome: '', cargo: '' }, { nome: '', cargo: '' }, { nome: '', cargo: '' }, { nome: '', cargo: '' }
  ]);

  const [numEmpregos, setNumEmpregos] = useState<number | ''>('');
  const [porteEmpresa, setPorteEmpresa] = useState<Porte>('');
  const [valorInvestimento, setValorInvestimento] = useState<number | ''>('');
  const [faturamentoAnual, setFaturamentoAnual] = useState<number | ''>('');
  const [numPCD, setNumPCD] = useState<number | ''>('');
  const [numJovemAprendiz, setNumJovemAprendiz] = useState<number | ''>('');
  const [numOutrasIniciativas, setNumOutrasIniciativas] = useState<number | ''>('');

  const [pontuacao, setPontuacao] = useState<Pontuacao>({
    empregos: 0, porte: 0, investimento: 0, faturamento: 0, desenvolvimento: 0, total: 0
  });

  const [incentivos, setIncentivos] = useState<Incentivos>({
    faixa: 'Não elegível', aluguel: 'Não elegível', obras: 'Não elegível',
    iptu: 'Não elegível', itbi: 'Não elegível', feiras: 'Não elegível',
    imoveis: 'Não elegível', limitacoes: []
  });

  const tabelaEmpregos = [
    { min: 1, max: 5, pontos: 5 }, { min: 6, max: 10, pontos: 10 },
    { min: 11, max: 20, pontos: 15 }, { min: 21, max: 40, pontos: 20 },
    { min: 41, max: Infinity, pontos: 25 }
  ];

  const tabelaPorte: Record<Porte, number> = {
    '': 0, 'MEI': 3, 'ME': 6, 'EPP': 9, 'Média': 12, 'Grande': 15
  };

  const tabelaInvestimento = [
    { min: 0, max: 35000, pontos: 5 }, { min: 35000.01, max: 100000, pontos: 10 },
    { min: 100000.01, max: 300000, pontos: 15 }, { min: 300000.01, max: 500000, pontos: 20 },
    { min: 500000.01, max: Infinity, pontos: 25 }
  ];

  const tabelaFaturamento = [
    { min: 0, max: 81000, pontos: 5 }, { min: 81000.01, max: 360000, pontos: 10 },
    { min: 360000.01, max: 4800000, pontos: 15 }, { min: 4800000.01, max: 10000000, pontos: 20 },
    { min: 10000000.01, max: Infinity, pontos: 25 }
  ];

  const tabelaIncentivos = [
    { faixa: "18 a 39 Pontos", min: 18, max: 39, aluguel: "16% a 30% por 12 meses", obras: "Até 10 URM", iptu: "25%", itbi: "25%", feiras: "1 URM", imoveis: "100 URM", limitacoes: [] },
    { faixa: "40 a 54 Pontos", min: 40, max: 54, aluguel: "31% a 35% por 24 meses", obras: "Até 20 URM", iptu: "50%", itbi: "50%", feiras: "2 URM", imoveis: "200 URM", limitacoes: [] },
    { faixa: "55 a 72 Pontos", min: 55, max: 72, aluguel: "36% a 40% por 36 meses", obras: "Até 50 URM", iptu: "75%", itbi: "75%", feiras: "4 URM", imoveis: "400 URM", limitacoes: [] },
    { faixa: "Acima de 72 Pontos", min: 73, max: Infinity, aluguel: "41% a 50% por 60 meses", obras: "Até 120 URM", iptu: "100%", itbi: "100%", feiras: "6 URM", imoveis: "600 URM", limitacoes: [] }
  ];

  const formatarCNPJ = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '');
    return apenasNumeros
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const formatarMoedaExibicao = (valor: number | undefined): string => {
    if (valor === undefined || isNaN(valor)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarMoedaDigitacao = (valor: string): string => {
    let apenasNumeros = valor.replace(/\D/g, '');
    if (!apenasNumeros) return '';
    const numero = parseInt(apenasNumeros, 10) / 100;
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const converterParaNumero = (valorFormatado: string): number => {
    return parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
  };

  const calcularPontosEmpregos = (num: number): number => {
    if (!num) return 0;
    const faixa = tabelaEmpregos.find(f => num >= f.min && num <= f.max);
    return faixa ? faixa.pontos : 0;
  };

  const calcularPontosInvestimento = (valor: number): number => {
    if (!valor) return 0;
    const faixa = tabelaInvestimento.find(f => valor >= f.min && valor <= f.max);
    return faixa ? faixa.pontos : 0;
  };

  const calcularPontosFaturamento = (valor: number): number => {
    if (!valor) return 0;
    const faixa = tabelaFaturamento.find(f => valor >= f.min && valor <= f.max);
    return faixa ? faixa.pontos : 0;
  };

  const calcularPontosDesenvolvimento = (pcd: number, jovem: number, outras: number): number => {
    const pontosPCD = pcd ? pcd * 2 : 0;
    const pontosJovem = jovem ? jovem * 2 : 0;
    const pontosOutras = outras ? outras * 1 : 0;
    return Math.min(10, pontosPCD + pontosJovem + pontosOutras);
  };

  // Simplificado para mostrar apenas o valor total máximo
  const gerarLimitacoesDinamicas = (valorLimitante: number | undefined): string[] => {
    if (valorLimitante === undefined || valorLimitante <= 0 || isNaN(valorLimitante)) {
      return ["Valor limitante não calculado. Preencha os campos de regime tributário."];
    }
    return [`Valor total máximo de incentivos: ${formatarMoedaExibicao(valorLimitante)}`];
  };

  const determinarIncentivos = (total: number): Incentivos => {
    if (total < 18) {
      return { faixa: 'Não elegível', aluguel: 'Não elegível', obras: 'Não elegível', iptu: 'Não elegível', itbi: 'Não elegível', feiras: 'Não elegível', imoveis: 'Não elegível', limitacoes: [] };
    }
    const faixa = tabelaIncentivos.find(f => total >= f.min && total <= f.max);
    if (faixa) {
      const limitacoes = gerarLimitacoesDinamicas(valoresTributarios.valorLimitanteIncentivos);
      return { ...faixa, limitacoes };
    }
    return { faixa: 'Não elegível', aluguel: 'Não elegível', obras: 'Não elegível', iptu: 'Não elegível', itbi: 'Não elegível', feiras: 'Não elegível', imoveis: 'Não elegível', limitacoes: [] };
  };

  const calcularValoresTributarios = () => {
    let novoValores: ValoresTributarios = { ...valoresTributarios }; // Manter valores anteriores
    let valorLimitanteFinal = 0;

    switch (regimeTributario) {
      case 'regimeGeral':
        if (novoValores.valorAdicionadoFiscal) {
          const estimativaRepasse = novoValores.valorAdicionadoFiscal * 0.024;
          valorLimitanteFinal = estimativaRepasse * 2;
          novoValores = { ...novoValores, estimativaRepasseVAF: estimativaRepasse, valorLimitanteIncentivos: valorLimitanteFinal };
        } else {
           novoValores = { ...novoValores, estimativaRepasseVAF: 0, valorLimitanteIncentivos: 0 };
        }
        break;
      case 'prestadorServico':
        if (novoValores.receitaAnualTributavel) {
          const estimativaReceita = novoValores.receitaAnualTributavel * 0.02;
          valorLimitanteFinal = estimativaReceita * 3;
          novoValores = { ...novoValores, estimativaReceitaLiquida: estimativaReceita, valorLimitanteIncentivos: valorLimitanteFinal };
        } else {
          novoValores = { ...novoValores, estimativaReceitaLiquida: 0, valorLimitanteIncentivos: 0 };
        }
        break;
      case 'simplesNacional':
        const { receitaSujeitaICMS, receitaSujeitaISSQN } = novoValores;
        let vlrLimICMS = 0;
        let vlrLimISSQN = 0;
        novoValores = { ...novoValores, vafPresumido: 0, estimativaRepasseICMS: 0, estimativaReceitaLiquidaISSQN: 0 }; 

        if (receitaSujeitaICMS) {
          const vafPresumido = receitaSujeitaICMS * 0.32;
          const estimativaRepasseICMS = vafPresumido * 0.024;
          vlrLimICMS = estimativaRepasseICMS * 2;
          novoValores = { ...novoValores, vafPresumido, estimativaRepasseICMS };
        }
        if (receitaSujeitaISSQN) {
          const estimativaReceitaISSQN = receitaSujeitaISSQN * 0.02;
          vlrLimISSQN = estimativaReceitaISSQN * 3;
          novoValores = { ...novoValores, estimativaReceitaLiquidaISSQN: estimativaReceitaISSQN };
        }
        valorLimitanteFinal = vlrLimICMS + vlrLimISSQN;
        novoValores = { ...novoValores, valorLimitanteIncentivos: valorLimitanteFinal };
        break;
      case 'misto':
        const { valorAdicionadoFiscalMisto, receitaAnualTributavelMisto } = novoValores;
        let vlrLimMistoICMS = 0;
        let vlrLimMistoISSQN = 0;
        novoValores = { ...novoValores, estimativaRepasseVAFMisto: 0, valorLimitanteIndustriaComercio: 0, estimativaReceitaLiquidaMisto: 0, valorLimitanteServicos: 0 };

        if (valorAdicionadoFiscalMisto) {
          const estimativaRepasseVAFMisto = valorAdicionadoFiscalMisto * 0.024;
          vlrLimMistoICMS = estimativaRepasseVAFMisto * 2;
          novoValores = { ...novoValores, estimativaRepasseVAFMisto, valorLimitanteIndustriaComercio: vlrLimMistoICMS };
        }
        if (receitaAnualTributavelMisto) {
          const estimativaReceitaLiquidaMisto = receitaAnualTributavelMisto * 0.02;
          vlrLimMistoISSQN = estimativaReceitaLiquidaMisto * 3;
          novoValores = { ...novoValores, estimativaReceitaLiquidaMisto, valorLimitanteServicos: vlrLimMistoISSQN };
        }
        valorLimitanteFinal = vlrLimMistoICMS + vlrLimMistoISSQN;
        novoValores = { ...novoValores, valorLimitanteIncentivos: valorLimitanteFinal };
        break;
      default:
        novoValores = { ...valoresTributarios, valorLimitanteIncentivos: 0 }; // Limpa se nenhum regime selecionado
        break;
    }
    setValoresTributarios(novoValores);
  };

  useEffect(() => {
    calcularValoresTributarios();
  }, [
    regimeTributario,
    valoresTributarios.valorAdicionadoFiscal,
    valoresTributarios.receitaAnualTributavel,
    valoresTributarios.receitaSujeitaICMS,
    valoresTributarios.receitaSujeitaISSQN,
    valoresTributarios.valorAdicionadoFiscalMisto,
    valoresTributarios.receitaAnualTributavelMisto
  ]);

  useEffect(() => {
    const pontosEmpregos = calcularPontosEmpregos(Number(numEmpregos) || 0);
    const pontosPorte = tabelaPorte[porteEmpresa] || 0;
    const pontosInvestimento = calcularPontosInvestimento(Number(valorInvestimento) || 0);
    const pontosFaturamento = calcularPontosFaturamento(Number(faturamentoAnual) || 0);
    const pontosDesenvolvimento = calcularPontosDesenvolvimento(
      Number(numPCD) || 0, Number(numJovemAprendiz) || 0, Number(numOutrasIniciativas) || 0
    );
    const total = pontosEmpregos + pontosPorte + pontosInvestimento + pontosFaturamento + pontosDesenvolvimento;
    setPontuacao({ empregos: pontosEmpregos, porte: pontosPorte, investimento: pontosInvestimento, faturamento: pontosFaturamento, desenvolvimento: pontosDesenvolvimento, total });
    setIncentivos(determinarIncentivos(total));
  }, [
    numEmpregos, porteEmpresa, valorInvestimento, faturamentoAnual, numPCD, numJovemAprendiz, numOutrasIniciativas, valoresTributarios.valorLimitanteIncentivos
  ]);

  const formatarDataAtual = (): string => new Date().toLocaleDateString('pt-BR');
  const gerarPDF = () => window.print();

  const criarHandlerMudancaMoeda = (
    setterFormatado: React.Dispatch<React.SetStateAction<string>>,
    campoValores: keyof ValoresTributarios
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarMoedaDigitacao(e.target.value);
    setterFormatado(valorFormatado);
    const valorNumerico = converterParaNumero(valorFormatado);
    setValoresTributarios(prev => ({ ...prev, [campoValores]: valorNumerico }));
  };

  const handleValorAdicionadoFiscalChange = criarHandlerMudancaMoeda(setValorAdicionadoFiscalFormatado, 'valorAdicionadoFiscal');
  const handleReceitaAnualTributavelChange = criarHandlerMudancaMoeda(setReceitaAnualTributavelFormatada, 'receitaAnualTributavel');
  const handleReceitaBrutaAcumuladaChange = criarHandlerMudancaMoeda(setReceitaBrutaAcumuladaFormatada, 'receitaBrutaAcumulada');
  const handleReceitaSujeitaICMSChange = criarHandlerMudancaMoeda(setReceitaSujeitaICMSFormatada, 'receitaSujeitaICMS');
  const handleReceitaSujeitaISSQNChange = criarHandlerMudancaMoeda(setReceitaSujeitaISSQNFormatada, 'receitaSujeitaISSQN');
  const handleValorAdicionadoFiscalMistoChange = criarHandlerMudancaMoeda(setValorAdicionadoFiscalMistoFormatado, 'valorAdicionadoFiscalMisto');
  const handleReceitaAnualTributavelMistoChange = criarHandlerMudancaMoeda(setReceitaAnualTributavelMistoFormatada, 'receitaAnualTributavelMisto');

  const handleValorInvestimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarMoedaDigitacao(e.target.value);
    setValorInvestimentoFormatado(valorFormatado);
    setValorInvestimento(converterParaNumero(valorFormatado));
  };

  const handleFaturamentoAnualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarMoedaDigitacao(e.target.value);
    setFaturamentoAnualFormatado(valorFormatado);
    setFaturamentoAnual(converterParaNumero(valorFormatado));
  };

  const handleMembroComissaoChange = (index: number, campo: keyof MembroComissao, valor: string) => {
    const novosMembros = [...membrosComissao];
    novosMembros[index] = { ...novosMembros[index], [campo]: valor };
    setMembrosComissao(novosMembros);
  };

  const limparCamposRegime = () => {
    setValorAdicionadoFiscalFormatado('');
    setReceitaAnualTributavelFormatada('');
    setReceitaBrutaAcumuladaFormatada('');
    setReceitaSujeitaICMSFormatada('');
    setReceitaSujeitaISSQNFormatada('');
    setValorAdicionadoFiscalMistoFormatado('');
    setReceitaAnualTributavelMistoFormatada('');
    setValoresTributarios({}); // Limpa todos os valores numéricos de regime
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <img src={brasaoIvoti} alt="Brasão de Ivoti" className="brasao" />
          <div><h1>Calculadora de Incentivos</h1><p>Lei Municipal Nº 3.706/2025 de Ivoti/RS</p></div>
        </div>
      </header>
      <main className="app-content">
        {/* Conteúdo para impressão - agora dividido em duas páginas físicas */}
        <div className="print-wrapper">
          {/* PÁGINA 1: Identificação, Pontuação, Incentivos e Parecer */}
          <div className="print-page page-1">
            <section className="form-section identificacao-solicitante">
              <h2>IDENTIFICAÇÃO DO SOLICITANTE</h2>
              <div className="form-group"><label htmlFor="cnpj">CNPJ:</label><input type="text" id="cnpj" value={cnpj} readOnly /></div>
              <div className="form-group"><label htmlFor="razaoSocial">Razão Social:</label><input type="text" id="razaoSocial" value={razaoSocial} readOnly /></div>
            </section>
            <section className="results-section pontuacao-calculada">
              <h2>PONTUAÇÃO CALCULADA</h2>
              <div className="results-group">
                <div className="result-item"><span className="result-label">Pontos por Empregos:</span><span className="result-value">{pontuacao.empregos}</span></div>
                <div className="result-item"><span className="result-label">Pontos por Porte:</span><span className="result-value">{pontuacao.porte}</span></div>
                <div className="result-item"><span className="result-label">Pontos por Investimento:</span><span className="result-value">{pontuacao.investimento}</span></div>
                <div className="result-item"><span className="result-label">Pontos por Faturamento:</span><span className="result-value">{pontuacao.faturamento}</span></div>
                <div className="result-item"><span className="result-label">Pontos por Desenvolvimento:</span><span className="result-value">{pontuacao.desenvolvimento}</span></div>
                <div className="result-item total"><span className="result-label">PONTUAÇÃO TOTAL:</span><span className="result-value">{pontuacao.total}</span></div>
                <div className="result-item eligibility"><span className="result-label">ELEGIBILIDADE:</span><span className={`result-value ${pontuacao.total >= 18 ? 'eligible' : 'not-eligible'}`}>{pontuacao.total >= 18 ? 'Sim' : 'Não'}</span></div>
              </div>
            </section>
            <section className="results-section incentivos-correspondentes">
              <h2>INCENTIVOS CORRESPONDENTES</h2>
              <div className="results-group">
                <div className="result-item"><span className="result-label">Faixa de Pontuação:</span><span className="result-value">{incentivos.faixa}</span></div>
                <div className="result-item"><span className="result-label">Aluguel (% e Período):</span><span className="result-value">{incentivos.aluguel}</span></div>
                <div className="result-item"><span className="result-label">Obras de Infraestrutura (Limite):</span><span className="result-value">{incentivos.obras}</span></div>
                <div className="result-item"><span className="result-label">Tributos IPTU (%):</span><span className="result-value">{incentivos.iptu}</span></div>
                <div className="result-item"><span className="result-label">Tributos ITBI (%):</span><span className="result-value">{incentivos.itbi}</span></div>
                <div className="result-item"><span className="result-label">Auxílio em Feiras (Limite):</span><span className="result-value">{incentivos.feiras}</span></div>
                <div className="result-item"><span className="result-label">Aquisição de Imóveis (Limite):</span><span className="result-value">{incentivos.imoveis}</span></div>
              </div>
              {incentivos.limitacoes.length > 0 && (
                <div className="limitacao-info">
                  <h3>LIMITAÇÕES DE VALORES:</h3>
                  <ul>{incentivos.limitacoes.map((limitacao, index) => (<li key={index}>{limitacao}</li>))}</ul>
                </div>
              )}
            </section>
            <section className="form-section parecer-comissao">
              <h2>PARECER DA COMISSÃO DE ANÁLISE DE INCENTIVOS</h2>
              <div className="parecer-texto">{parecerComissao || "Parecer não informado"}</div>
            </section>
          </div>

          {/* PÁGINA 2: Assinaturas */}
          <div className="print-page page-2">
            <section className="assinaturas-section">
              <h2>ASSINATURAS DA COMISSÃO</h2>
              <div className="assinaturas-grid">
                {membrosComissao.map((membro, index) => (
                  <div key={index} className="assinatura-item">
                    <div className="assinatura-linha"></div>
                    <div className="assinatura-nome">{membro.nome || `Membro ${index + 1}`}</div>
                    <div className="assinatura-cargo">{membro.cargo || 'Cargo não informado'}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Formulário para preenchimento (visível apenas na web) */}
        <div className="form-container no-print">
          <section className="form-section">
            <h2>Identificação do Solicitante</h2>
            <div className="form-group"><label htmlFor="cnpj-form">CNPJ:</label><input type="text" id="cnpj-form" value={cnpj} onChange={(e) => setCnpj(formatarCNPJ(e.target.value))} placeholder="XX.XXX.XXX/XXXX-XX" maxLength={18} /></div>
            <div className="form-group"><label htmlFor="razaoSocial-form">Razão Social:</label><input type="text" id="razaoSocial-form" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Nome completo da empresa" /></div>
          </section>
          <section className="form-section regime-tributario">
            <h2>Regime Tributário</h2>
            <div className="form-group">
              <label htmlFor="regimeTributario">Selecione o Regime Tributário:</label>
              <select id="regimeTributario" value={regimeTributario} onChange={(e) => { setRegimeTributario(e.target.value as RegimeTributario); limparCamposRegime(); }}>
                <option value="">Selecione uma opção</option>
                <option value="regimeGeral">Regime Geral (Indústria/Comércio)</option>
                <option value="prestadorServico">Prestador de Serviços</option>
                <option value="simplesNacional">Optante pelo Simples Nacional</option>
                <option value="misto">Misto (Indústria/Comércio e Serviços)</option>
              </select>
            </div>
            {regimeTributario === 'regimeGeral' && (
              <div className="regime-campos">
                <div className="form-group"><label htmlFor="valorAdicionadoFiscal">Valor Adicionado Fiscal (VAF) em R$:</label><input type="text" id="valorAdicionadoFiscal" value={valorAdicionadoFiscalFormatado} onChange={handleValorAdicionadoFiscalChange} placeholder="0,00" className="input-monetario" /></div>
                <div className="resultado-calculo"><span className="resultado-label">Estimativa de Repasse (2,4% VAF):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.estimativaRepasseVAF)}</span></div>
                <div className="resultado-calculo"><span className="resultado-label">Valor Limitante (2x Repasse):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.valorLimitanteIncentivos)}</span></div>
              </div>
            )}
            {regimeTributario === 'prestadorServico' && (
              <div className="regime-campos">
                <div className="form-group"><label htmlFor="receitaAnualTributavel">Receita Anual Tributável no Município em R$:</label><input type="text" id="receitaAnualTributavel" value={receitaAnualTributavelFormatada} onChange={handleReceitaAnualTributavelChange} placeholder="0,00" className="input-monetario" /></div>
                <div className="resultado-calculo"><span className="resultado-label">Estimativa Receita Líquida (2%):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.estimativaReceitaLiquida)}</span></div>
                <div className="resultado-calculo"><span className="resultado-label">Valor Limitante (3x ISSQN):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.valorLimitanteIncentivos)}</span></div>
              </div>
            )}
            {regimeTributario === 'simplesNacional' && (
              <div className="regime-campos">
                <div className="form-group"><label htmlFor="receitaBrutaAcumulada">Receita Bruta Acumulada Ano Anterior R$:</label><input type="text" id="receitaBrutaAcumulada" value={receitaBrutaAcumuladaFormatada} onChange={handleReceitaBrutaAcumuladaChange} placeholder="0,00" className="input-monetario" /></div>
                <div className="form-group"><label htmlFor="receitaSujeitaICMS">Receita Sujeita ao ICMS R$:</label><input type="text" id="receitaSujeitaICMS" value={receitaSujeitaICMSFormatada} onChange={handleReceitaSujeitaICMSChange} placeholder="0,00" className="input-monetario" /></div>
                {valoresTributarios.receitaSujeitaICMS && (<><div className="resultado-calculo"><span className="resultado-label">VAF Presumido (32%):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.vafPresumido)}</span></div><div className="resultado-calculo"><span className="resultado-label">Estimativa Repasse ICMS (2,4% VAF):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.estimativaRepasseICMS)}</span></div></>)}
                <div className="form-group"><label htmlFor="receitaSujeitaISSQN">Receita Sujeita ao ISSQN R$:</label><input type="text" id="receitaSujeitaISSQN" value={receitaSujeitaISSQNFormatada} onChange={handleReceitaSujeitaISSQNChange} placeholder="0,00" className="input-monetario" /></div>
                {valoresTributarios.receitaSujeitaISSQN && (<div className="resultado-calculo"><span className="resultado-label">Estimativa Receita Líquida ISSQN (2%):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.estimativaReceitaLiquidaISSQN)}</span></div>)}
                {valoresTributarios.valorLimitanteIncentivos && (<div className="resultado-calculo"><span className="resultado-label">Valor Limitante (Combinado):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.valorLimitanteIncentivos)}</span></div>)}
              </div>
            )}
            {regimeTributario === 'misto' && (
              <div className="regime-campos">
                <div className="form-group"><label htmlFor="valorAdicionadoFiscalMisto">VAF (Indústria/Comércio) R$:</label><input type="text" id="valorAdicionadoFiscalMisto" value={valorAdicionadoFiscalMistoFormatado} onChange={handleValorAdicionadoFiscalMistoChange} placeholder="0,00" className="input-monetario" /></div>
                {valoresTributarios.valorAdicionadoFiscalMisto && (<><div className="resultado-calculo"><span className="resultado-label">Estimativa Repasse VAF (2,4%):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.estimativaRepasseVAFMisto)}</span></div><div className="resultado-calculo"><span className="resultado-label">Valor Limitante Ind./Com. (2x Repasse):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.valorLimitanteIndustriaComercio)}</span></div></>)}
                <div className="form-group"><label htmlFor="receitaAnualTributavelMisto">Receita Anual Tributável (Serviços) R$:</label><input type="text" id="receitaAnualTributavelMisto" value={receitaAnualTributavelMistoFormatada} onChange={handleReceitaAnualTributavelMistoChange} placeholder="0,00" className="input-monetario" /></div>
                {valoresTributarios.receitaAnualTributavelMisto && (<><div className="resultado-calculo"><span className="resultado-label">Estimativa Receita Líquida (2%):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.estimativaReceitaLiquidaMisto)}</span></div><div className="resultado-calculo"><span className="resultado-label">Valor Limitante Serviços (3x ISSQN):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.valorLimitanteServicos)}</span></div></>)}
                {valoresTributarios.valorLimitanteIncentivos && (<div className="resultado-calculo"><span className="resultado-label">Valor Limitante Total (Combinado):</span><span className="resultado-valor">{formatarMoedaExibicao(valoresTributarios.valorLimitanteIncentivos)}</span></div>)}
              </div>
            )}
          </section>
          <section className="form-section empregos"><h2>Informações sobre Empregos</h2><div className="form-group"><label htmlFor="numEmpregos">Número de Empregos Gerados:</label><input type="number" id="numEmpregos" min="0" value={numEmpregos} onChange={(e) => setNumEmpregos(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 15" /><small>Informe o número total de postos de trabalho diretos</small></div></section>
          <section className="form-section porte"><h2>Porte da Empresa</h2><div className="form-group"><label htmlFor="porteEmpresa">Selecione o Porte da Empresa:</label><select id="porteEmpresa" value={porteEmpresa} onChange={(e) => setPorteEmpresa(e.target.value as Porte)}><option value="">Selecione uma opção</option><option value="MEI">Microempreendedor Individual (MEI)</option><option value="ME">Microempresa (ME)</option><option value="EPP">Empresa de Pequeno Porte (EPP)</option><option value="Média">Média Empresa</option><option value="Grande">Grande Empresa</option></select><small>Selecione conforme classificação federal</small></div></section>
          <section className="form-section investimento-faturamento"><h2>Investimento e Faturamento</h2><div className="form-group"><label htmlFor="valorInvestimento">Valor Total do Investimento (R$):</label><input type="text" id="valorInvestimento" value={valorInvestimentoFormatado} onChange={handleValorInvestimentoChange} placeholder="0,00" className="input-monetario" /><small>Informe o valor total do investimento em reais</small></div><div className="form-group"><label htmlFor="faturamentoAnual">Faturamento Anual (R$):</label><input type="text" id="faturamentoAnual" value={faturamentoAnualFormatado} onChange={handleFaturamentoAnualChange} placeholder="0,00" className="input-monetario" /><small>Informe o faturamento anual em reais</small></div></section>
          <section className="form-section desenvolvimento"><h2>Desenvolvimento Econômico Social e Ambiental</h2><div className="form-group"><label htmlFor="numPCD">Contratação de Pessoas com Deficiência (PCD):</label><input type="number" id="numPCD" min="0" value={numPCD} onChange={(e) => setNumPCD(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 2" /><small>Informe o número de PCDs contratados</small></div><div className="form-group"><label htmlFor="numJovemAprendiz">Programas de Jovem Aprendiz:</label><input type="number" id="numJovemAprendiz" min="0" value={numJovemAprendiz} onChange={(e) => setNumJovemAprendiz(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 3" /><small>Informe o número de jovens aprendizes</small></div><div className="form-group"><label htmlFor="numOutrasIniciativas">Outras Iniciativas Aprovadas:</label><input type="number" id="numOutrasIniciativas" min="0" value={numOutrasIniciativas} onChange={(e) => setNumOutrasIniciativas(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 1" /><small>Informe o número de outras iniciativas aprovadas pela comissão</small></div></section>
          <section className="form-section"><h2>Parecer da Comissão de Análise de Incentivos</h2><div className="form-group"><label htmlFor="parecerComissao">Parecer:</label><textarea id="parecerComissao" rows={8} minLength={10} maxLength={2000} value={parecerComissao} onChange={(e) => setParecerComissao(e.target.value)} placeholder="Digite o parecer da comissão de análise de incentivos..." /><small>Mínimo de 10 caracteres, máximo de 2000</small></div></section>
          <section className="form-section membros-comissao"><h2>Membros da Comissão</h2><p>Informe os nomes e cargos dos membros da comissão para assinatura:</p>{membrosComissao.map((membro, index) => (<div key={index} className="form-group membro-comissao"><h3>Membro {index + 1}</h3><div className="form-group"><label htmlFor={`membro-nome-${index}`}>Nome:</label><input type="text" id={`membro-nome-${index}`} value={membro.nome} onChange={(e) => handleMembroComissaoChange(index, 'nome', e.target.value)} placeholder="Nome completo" /></div><div className="form-group"><label htmlFor={`membro-cargo-${index}`}>Cargo:</label><input type="text" id={`membro-cargo-${index}`} value={membro.cargo} onChange={(e) => handleMembroComissaoChange(index, 'cargo', e.target.value)} placeholder="Cargo ou função" /></div></div>))}</section>
        </div>
        <div className="results-container no-print">
          <div className="print-section"><button onClick={gerarPDF} className="print-button">Imprimir / Salvar PDF</button></div>
        </div>
      </main>
      <footer className="app-footer">
        <p>Calculadora baseada na Lei Municipal Nº 3.706/2025 de Ivoti/RS</p>
        <p className="data-atual">Documento gerado em {formatarDataAtual()}</p>
      </footer>
    </div>
  );
}

export default App;
