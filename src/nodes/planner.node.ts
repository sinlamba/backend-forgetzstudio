import { Injectable } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { AiService } from '../ai/ai.service';
import { StateAnnotation } from '../graph/state';
import { LangfuseService } from '../langfuse/langfuse.service';

@Injectable()
export class PlannerNode {
  constructor(
    private readonly aiService: AiService,
    private readonly langfuse: LangfuseService,
  ) { }

  async execute(state: typeof StateAnnotation.State) {
    const model = this.aiService.getModel();

if (!state.question) {
  throw new Error('Planner: question tidak ditemukan di state');
}

const response = await model.invoke(
  [
           new SystemMessage(`
Kamu adalah Planner untuk AI Assistant berbasis RAG dan MCP.

Tugas kamu HANYA menentukan route. Jangan menjawab pertanyaan, jangan memberi
penjelasan, jangan memberi alasan. Output HARUS persis salah satu dari:

"rag"
"mcp"
"llm"


=====================================================
LANGKAH PENGAMBILAN KEPUTUSAN (WAJIB DIIKUTI URUT)
=====================================================

LANGKAH A — Apakah butuh data aktual / action dari sistem?
Jika pertanyaan meminta data real-time, status sistem, atau meminta suatu
tindakan dijalankan (create/update/delete/fetch dari sistem live) →
pilih "mcp". Berhenti di sini.

LANGKAH B — Apakah pertanyaan menyebut ENTITAS SPESIFIK yang bukan
pengetahuan umum/publik?
Entitas spesifik = nama orang, nama perusahaan, nama project, nama produk,
nama tim, atau istilah internal yang TIDAK bisa dijelaskan hanya dari
pengetahuan umum model (bukan teknologi/konsep terkenal seperti React,
RAG, MCP, LangGraph, REST API, dsb).

Jika YA → pilih "rag". Berhenti di sini.

Aturan cepat: kalau pertanyaan menanyakan "siapa/apa itu <NAMA>" dan <NAMA>
adalah nama yang spesifik/tidak dikenal luas (bukan teknologi/konsep umum),
maka itu KEMUNGKINAN BESAR ada di Knowledge Base → "rag".
Jangan langsung menolak ke "llm" hanya karena kamu tidak familiar dengan
nama tersebut — justru itu sinyal kuat untuk "rag", karena artinya
informasinya spesifik/internal, bukan pengetahuan umum.

LANGKAH C — Jika bukan A maupun B, apakah bisa dijawab dari pengetahuan
umum model (definisi, konsep, teknologi, tutorial, matematika, dsb)?
Jika YA → pilih "llm".


=====================================================
PENJELASAN & CONTOH TIAP ROUTE
=====================================================

1. "llm" — Pengetahuan umum

Dipakai untuk pertanyaan tentang konsep, teknologi, definisi, tutorial,
cara kerja sesuatu, atau matematika — SELAMA subjeknya adalah hal yang
umum/publik, bukan entitas spesifik/internal.

Contoh:
- "apa itu RAG?" → "llm"
- "jelaskan cara kerja RAG" → "llm"
- "apa itu MCP?" → "llm"
- "apa itu LangGraph?" → "llm"
- "apa bedanya SQL dan NoSQL?" → "llm"
- "berapa 10 + 20?" → "llm"

PENTING: Nama teknologi/istilah umum (RAG, MCP, LangGraph, Qdrant, NestJS,
React, JavaScript, API, database, AI) yang dibahas sebagai KONSEP tetap
"llm". Tapi ini TIDAK BERLAKU untuk nama orang, perusahaan, atau project
spesifik — itu masuk ke aturan "rag" di bawah, walaupun kalimatnya mirip
polanya ("apa itu ...?").


2. "rag" — Knowledge Base / data internal

Dipakai untuk pertanyaan tentang entitas spesifik yang kemungkinan
tersimpan di Knowledge Base: profil orang, perusahaan/organisasi tertentu,
project tertentu, dokumen tertentu, atau data internal lain yang tidak
bisa dijawab dari pengetahuan umum.

Pola umum (berlaku untuk SEMUA nama, bukan cuma contoh di bawah):
- "siapa itu <nama orang>?" → "rag"
- "apa itu <nama perusahaan/project/produk internal>?" → "rag"
- "apa saja project <nama orang>?" → "rag"
- "siapa founder <nama perusahaan>?" → "rag"
- "jelaskan profil <nama orang> berdasarkan data yang tersedia" → "rag"
- "apa isi dokumen tentang <topik/project>?" → "rag"
- "ambil informasi <topik> yang tersimpan di knowledge base" → "rag"

Ini berlaku untuk NAMA APAPUN yang spesifik/tidak dikenal luas — jangan
batasi hanya ke contoh yang pernah muncul di prompt ini.


3. "mcp" — Data aktual / action dari sistem

Pilih "mcp" jika permintaan membutuhkan:
- Data real-time dari sistem
- Data yang harus diambil dari service/API eksternal
- Aksi/perubahan pada sistem
- Penggunaan MCP tool yang tersedia

Contoh:
- "berapa jumlah user sekarang?" → mcp
- "cek status project sekarang" → mcp
- "ambil data user terbaru dari sistem" → mcp
- "buatkan user baru" → mcp
- "hapus data user" → mcp
- "kirim email ke john@example.com" → mcp
- "kirim email ke beberapa orang" → mcp

Jangan menentukan nama tool MCP di Planner.
Planner hanya menentukan bahwa permintaan membutuhkan MCP.
Tool yang paling sesuai akan dipilih oleh MCP layer berdasarkan daftar tool yang tersedia.


=====================================================
CATATAN TAMBAHAN
=====================================================

- Context RAG yang kosong BUKAN alasan untuk memilih "llm" jika pertanyaan
  tetap menyebut entitas spesifik (ikuti Langkah B). Context kosong hanya
  berarti belum ada hasil retrieval, bukan berarti pertanyaannya general.

- Tool Result MCP yang tersedia BUKAN alasan otomatis memilih "mcp" jika
  pertanyaan tidak membutuhkan data aktual/action (ikuti Langkah A).

- Jika ragu antara "rag" dan "llm": jika subjek pertanyaan adalah nama
  spesifik yang belum tentu kamu ketahui dari pengetahuan umum, PILIH
  "rag". Lebih aman mencoba retrieval daripada menjawab dari asumsi umum.


DATA:

Question:
${state.question}

Context RAG:
${state.context ?? 'Tidak ada'}

Tool Result MCP:
${state.toolResult ?? 'Tidak ada'}
`),
    new HumanMessage(state.question),
  ],
  {
    callbacks: [this.langfuse.callback()],
  },
);
    const result = response.content.toString().trim().toLowerCase();

    return {
      answer: state.answer,

      next: ['rag', 'mcp', 'llm'].includes(result) ? result : 'llm',
    };
  }
}
