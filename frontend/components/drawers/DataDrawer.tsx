'use client';

import { useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAgentStore } from '@/store/agentStore';

const inputClass =
  'flex-1 bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DataDrawer({ open, onClose }: Props) {
  const data = useAgentStore((s) => s.data);
  const setData = useAgentStore((s) => s.setData);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiValue, setApiValue] = useState('');

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    const mapped = dropped.map((f) => ({ name: f.name, type: f.type }));
    setData({ files: [...data.files, ...mapped] });
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const mapped = picked.map((f) => ({ name: f.name, type: f.type }));
    setData({ files: [...data.files, ...mapped] });
    // Reset input so same file can be re-added
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(index: number) {
    setData({ files: data.files.filter((_, i) => i !== index) });
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setData({ urls: [...data.urls, trimmed] });
    setUrlInput('');
  }

  function removeUrl(index: number) {
    setData({ urls: data.urls.filter((_, i) => i !== index) });
  }

  function addApiConnection() {
    if (!apiKey.trim()) return;
    setData({ apiConnections: [...data.apiConnections, { key: apiKey.trim(), value: apiValue.trim() }] });
    setApiKey('');
    setApiValue('');
  }

  function removeApiConnection(index: number) {
    setData({ apiConnections: data.apiConnections.filter((_, i) => i !== index) });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] text-white border-[#1e2d3d] overflow-y-auto p-6 space-y-6"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Data & Context</SheetTitle>
        </SheetHeader>

        {/* File Dropzone */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Files</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#1e2d3d] rounded-lg p-6 text-center cursor-pointer hover:border-[#76b900]/50 transition-colors"
          >
            <p className="text-sm text-gray-400">Drop files here or click to browse</p>
            <p className="text-xs text-gray-600 mt-1">PDF, DOCX, CSV, MD, TXT</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.csv,.md,.txt"
            onChange={handleFileInput}
            className="hidden"
          />
          {data.files.length > 0 && (
            <ul className="space-y-1">
              {data.files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2"
                >
                  <span className="text-sm text-gray-300 truncate mr-2">{f.name}</span>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-xs flex-shrink-0"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* URL Indexer */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">URL Indexer</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addUrl(); }}
              placeholder="https://example.com/docs"
              className={inputClass}
            />
            <button
              onClick={addUrl}
              className="px-3 py-2 rounded-md bg-[#76b900] hover:bg-[#8fd000] text-black text-sm font-medium transition-colors"
            >
              Add URL
            </button>
          </div>
          {data.urls.length > 0 && (
            <ul className="space-y-1">
              {data.urls.map((url, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2"
                >
                  <span className="text-sm text-gray-300 truncate mr-2">{url}</span>
                  <button
                    onClick={() => removeUrl(i)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-xs flex-shrink-0"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* API Connections */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">API Connections</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Key"
              className={inputClass}
            />
            <input
              type="text"
              value={apiValue}
              onChange={(e) => setApiValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addApiConnection(); }}
              placeholder="Value"
              className={inputClass}
            />
            <button
              onClick={addApiConnection}
              className="px-3 py-2 rounded-md bg-[#76b900] hover:bg-[#8fd000] text-black text-sm font-medium transition-colors flex-shrink-0"
            >
              Add
            </button>
          </div>
          {data.apiConnections.length > 0 && (
            <ul className="space-y-1">
              {data.apiConnections.map((conn, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2"
                >
                  <span className="text-sm text-gray-300 truncate mr-2">
                    <span className="text-[#76b900]">{conn.key}</span>
                    {conn.value && <span className="text-gray-500">: {conn.value}</span>}
                  </span>
                  <button
                    onClick={() => removeApiConnection(i)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-xs flex-shrink-0"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Data Format Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Data Format</label>
          <div className="flex gap-2">
            <button
              onClick={() => setData({ structured: true })}
              className={`flex-1 py-2 rounded-md border text-sm font-medium transition-all ${
                data.structured
                  ? 'bg-[#76b900] border-[#76b900] text-black'
                  : 'bg-[#1a1a2e] border-[#1e2d3d] text-gray-300 hover:border-[#76b900]/40'
              }`}
            >
              Structured
            </button>
            <button
              onClick={() => setData({ structured: false })}
              className={`flex-1 py-2 rounded-md border text-sm font-medium transition-all ${
                !data.structured
                  ? 'bg-[#76b900] border-[#76b900] text-black'
                  : 'bg-[#1a1a2e] border-[#1e2d3d] text-gray-300 hover:border-[#76b900]/40'
              }`}
            >
              Unstructured
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
