# 🎓 Guida Presentazione School AI Avatar

Questa guida ti aiuterà a configurare il progetto su un nuovo computer (portatile) per la presentazione.

## 📋 Prerequisiti
1.  **Internet**: Il computer DEVE essere connesso a internet (hotspot o Wi-Fi).
2.  **Node.js**: Scarica e installa la versione **LTS** da [nodejs.org](https://nodejs.org/).

## 🚀 Installazione Rapida (Windows)
1.  Copia l'intera cartella `school-ai-avatar` sul nuovo PC.
2.  **IMPORTANTE**: Assicurati che il file `.env` dentro la cartella `server` sia stato copiato!
    *   Apri la cartella `server` e controlla se c'è un file chiamato `.env`.
    *   Se non c'è, crealo e incollaci dentro le chiavi (vedi sezione "Contenuto .env").
3.  Fai doppio click sul file **`setup_and_start.bat`** (che troverai nella cartella principale).
    *   Questo script installerà automaticamente tutto e avvierà il programma.
    *   Si apriranno due finestre nere: non chiuderle!

## 🔧 Installazione Manuale (se lo script non va)
Se preferisci fare a mano o se lo script dà errori:

1.  **Backend (Server)**
    *   Apri la cartella `server`.
    *   Tasto destro > "Apri nel terminale" (o CMD).
    *   Scrivi: `npm install` e premi Invio (attendi la fine).
    *   Scrivi: `npm run dev` e premi Invio.
    *   Dovresti vedere: `Server is running at http://localhost:3001`

2.  **Frontend (Interfaccia)**
    *   Torna alla cartella principale `school-ai-avatar`.
    *   Apri un NUOVO terminale qui.
    *   Scrivi: `npm install` e premi Invio.
    *   Scrivi: `npm run dev` e premi Invio.
    *   Dovresti vedere un link (es. `http://localhost:5173`). Ctrl+Click per aprire.

## 🔑 Contenuto File `.env` (Server)
Il file `server/.env` deve contenere queste righe (recuperale dal tuo PC fisso):

```env
OPENAI_API_KEY=sk-proj-....
PINECONE_API_KEY=pcsk_....
PINECONE_INDEX_NAME=school-ai-index
```

## ⚠️ Risoluzione Problemi
*   **Errore "Network Error" o Avatar muto**: Controlla la connessione internet.
*   **Errore Microfono**: Assicurati di aver dato i permessi al browser (clicca sul lucchetto nella barra degli indirizzi).
*   **Pagine bianche**: Controlla che ENTRAMBE le finestre nere (terminali) siano aperte e senza errori rossi.
