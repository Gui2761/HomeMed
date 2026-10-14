// Utilitários de Formatação e Validação - Padrão Regulatório Brasileiro

/**
 * Formata telefone/WhatsApp com máscara dinâmica:
 * 10 dígitos: (XX) XXXX-XXXX
 * 11 dígitos: (XX) XXXXX-XXXX
 * Impede estritamente a inserção de letras ou caracteres não numéricos.
 */
export function formatarTelefone(valor) {
  if (!valor) return '';
  const digitos = String(valor).replace(/\D/g, '').slice(0, 11);
  if (digitos.length === 0) return '';
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7, 11)}`;
}

/**
 * Valida se o telefone possui DDD válido (11 a 99) e 10 ou 11 dígitos.
 */
export function validarTelefone(valor) {
  if (!valor) return false;
  const digitos = String(valor).replace(/\D/g, '');
  if (digitos.length !== 10 && digitos.length !== 11) return false;

  const ddd = parseInt(digitos.slice(0, 2), 10);
  if (isNaN(ddd) || ddd < 11 || ddd > 99) return false;

  // Celulares no Brasil (11 dígitos) começam com o dígito 9 após o DDD
  if (digitos.length === 11 && digitos[2] !== '9') return false;

  return true;
}

/**
 * Formata CEP no padrão Correios: 00000-000
 */
export function formatarCep(valor) {
  if (!valor) return '';
  const digitos = String(valor).replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 5) return digitos;
  return `${digitos.slice(0, 5)}-${digitos.slice(5, 8)}`;
}

/**
 * Valida se o CEP possui exatamente 8 dígitos numéricos.
 */
export function validarCep(valor) {
  if (!valor) return false;
  const digitos = String(valor).replace(/\D/g, '');
  return digitos.length === 8;
}

/**
 * Consulta de endereço nos Correios via API pública do ViaCEP com fallback BrasilAPI
 */
export async function buscarEnderecoPorCep(cepInput) {
  const cepLimpo = String(cepInput || '').replace(/\D/g, '');
  if (cepLimpo.length !== 8) return null;

  // 1ª Tentativa: ViaCEP (Oficial Correios)
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (res.ok) {
      const data = await res.json();
      if (!data.erro) {
        return {
          cep: data.cep || formatarCep(cepLimpo),
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          uf: data.uf || '',
          sucesso: true,
          fonte: 'ViaCEP / Correios'
        };
      }
    }
  } catch (err) {
    console.warn('ViaCEP indisponível, acionando fallback BrasilAPI...', err);
  }

  // 2ª Tentativa: BrasilAPI (Fallback robusto)
  try {
    const resFallback = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
    if (resFallback.ok) {
      const data = await resFallback.json();
      return {
        cep: formatarCep(data.cep || cepLimpo),
        logradouro: data.street || '',
        bairro: data.neighborhood || '',
        cidade: data.city || '',
        uf: data.state || '',
        sucesso: true,
        fonte: 'BrasilAPI / Correios'
      };
    }
  } catch (errFallback) {
    console.warn('Fallback BrasilAPI também falhou:', errFallback);
  }

  return { sucesso: false, erro: 'CEP não encontrado na base oficial dos Correios.' };
}
