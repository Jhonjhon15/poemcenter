import React from 'react';
import { LivroForm } from './LivroForm';

function App() {
  return (
    <div>
      <header style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Meu Livro App</h1>
      </header>
      <main>
        <LivroForm />
      </main>
    </div>
  );
}

export default App;