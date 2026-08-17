import React, { useState } from 'react';
import { supabase } from './supabaseClient'; 

export function LivroForm() {
  const [biografia, setBiografia] = useState('');
  const [notaFinal, setNotaFinal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const novoId = Date.now().toString();

    const { data, error } = await supabase
      .from('books')
      .insert([
        { 
          id: novoId, 
          biografia: biografia, 
          notaFinal: notaFinal,
          capa: null, 
          partes: null 
        }
      ]);

    setLoading(false);

    if (error) {
      console.error('Erro ao salvar livro:', error);
      alert('Erro ao salvar o livro. Veja o console.');
    } else {
      alert('Livro salvo com sucesso no Supabase!');
      setBiografia('');
      setNotaFinal('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Adicionar Novo Livro</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label>Biografia / Descrição:</label>
          <textarea 
            value={biografia} 
            onChange={(e) => setBiografia(e.target.value)} 
            rows="3"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label>Nota Final:</label>
          <input 
            type="text" 
            value={notaFinal} 
            onChange={(e) => setNotaFinal(e.target.value)} 
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Salvando...' : 'Salvar no Supabase'}
        </button>
      </form>
    </div>
  );
}