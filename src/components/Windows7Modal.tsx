import React, { useState } from 'react';
import { X, Terminal, Download, Check, Copy, AlertTriangle, ShieldCheck, FileCode, FolderTree, Cpu } from 'lucide-react';
import { LOCAL_PROJECT_FILES, downloadProjectZip } from '../lib/exportZip';

interface Windows7ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Windows7Modal: React.FC<Windows7ModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'compatibility' | 'commands' | 'structure' | 'code'>('compatibility');
  const [activeCodeFile, setActiveCodeFile] = useState<'main.py' | 'requirements.txt' | 'run.bat' | 'static/index.html'>('main.py');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getCodeContent = () => {
    switch (activeCodeFile) {
      case 'main.py':
        return LOCAL_PROJECT_FILES.mainPy;
      case 'requirements.txt':
        return LOCAL_PROJECT_FILES.requirementsTxt;
      case 'run.bat':
        return LOCAL_PROJECT_FILES.runBat;
      case 'static/index.html':
        return LOCAL_PROJECT_FILES.staticHtml;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Windows 7 Compatibility & Local Python Guide</h2>
              <p className="text-xs text-slate-400">FastAPI + Pillow + U²-Net AI Model &bull; 100% Free Local Execution</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadProjectZip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project .ZIP</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-900/50 text-xs">
          <button
            onClick={() => setActiveTab('compatibility')}
            className={`pb-3 px-3 font-semibold transition border-b-2 ${
              activeTab === 'compatibility'
                ? 'text-blue-400 border-blue-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            1. Windows 7 Compatibility & Model Choice
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`pb-3 px-3 font-semibold transition border-b-2 ${
              activeTab === 'commands'
                ? 'text-blue-400 border-blue-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            2. Installation & Run Commands
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`pb-3 px-3 font-semibold transition border-b-2 ${
              activeTab === 'structure'
                ? 'text-blue-400 border-blue-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            3. Project Folder Structure
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 px-3 font-semibold transition border-b-2 ${
              activeTab === 'code'
                ? 'text-blue-400 border-blue-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            4. Complete Source Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          {activeTab === 'compatibility' && (
            <div className="space-y-5">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3 text-amber-200 text-xs leading-relaxed">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong className="font-semibold text-amber-300">Crucial Windows 7 Python Rule:</strong>
                  <p className="mt-1">
                    Do not install Python 3.9, 3.10, 3.11, or 3.12 on standard Windows 7. Python officially dropped Windows 7 support starting with Python 3.9.0. Standard installers will refuse to run or fail on missing DLLs like <code className="bg-amber-950 px-1 py-0.5 rounded">api-ms-win-core-path-l1-1-0.dll</code>.
                  </p>
                </div>
              </div>

              {/* Exact Compatible Versions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> Compatible Python Stack
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>&bull; <strong className="text-white">Python 3.8.10 (64-bit)</strong> &ndash; The final official version for Win7.</li>
                    <li>&bull; <strong className="text-white">Windows 7 SP1 x64</strong> with update KB2533623 or KB3063858.</li>
                    <li>&bull; <strong className="text-white">FastAPI 0.95.2</strong> + <strong className="text-white">Uvicorn 0.22.0</strong>.</li>
                    <li>&bull; <strong className="text-white">Pillow 9.5.0</strong> (clean C-extension binaries for Win7).</li>
                  </ul>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
                    <Cpu className="w-4 h-4" /> AI Model Choice: U²-Net via ONNX
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li>&bull; <strong className="text-white">Model: U²-Net (or U²-Netp)</strong> &ndash; 100% free open-source.</li>
                    <li>&bull; <strong className="text-white">Engine: onnxruntime 1.14.1 (CPU)</strong>.</li>
                    <li>&bull; Zero GPU or CUDA drivers required.</li>
                    <li>&bull; Runs reliably on dual-core and quad-core CPUs.</li>
                  </ul>
                </div>
              </div>

              {/* Why RMBG-2.0 is NOT practical on Windows 7 */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Why is RMBG-2.0 Not Practical on Windows 7?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  BRIA RMBG-2.0 was built on BiRefNet and published in late 2024. It strictly requires:
                </p>
                <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1 pl-2">
                  <li><span className="text-slate-200">Python &gt;= 3.10:</span> Python 3.10 cannot run natively on Windows 7.</li>
                  <li><span className="text-slate-200">PyTorch &gt;= 2.2:</span> Windows binaries for modern PyTorch call Windows 10 Universal CRT and threading APIs not present in Windows 7 kernel.</li>
                  <li><span className="text-slate-200">Heavy GPU Driver Requirement:</span> Requires modern CUDA 12, whereas Windows 7 NVIDIA drivers were retired years ago.</li>
                </ol>
                <p className="text-xs text-emerald-400 font-medium pt-1">
                  &rarr; Conclusion: U²-Net via ONNX Runtime is the proven, high-quality open-source solution for product image background removal on Windows 7.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Step 1: Download Python 3.8.10 (64-bit)
                  </span>
                  <a
                    href="https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Direct Python.org Installer (.exe) &rarr;
                  </a>
                </div>
                <p className="text-xs text-slate-400">
                  Run the installer and make sure to check the box: <strong className="text-white">&quot;Add Python 3.8 to PATH&quot;</strong>.
                </p>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Step 2: Install Dependencies & Run (Automatic)
                  </span>
                  <button
                    onClick={() => handleCopy('run.bat', 'bat')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'bat' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Simply double-click <code className="text-emerald-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">run.bat</code>. It creates the virtual environment, installs requirements, and launches your browser to <code className="text-blue-300 font-mono">http://127.0.0.1:8000</code>.
                </p>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Step 3: Manual Command Prompt Execution (Optional)
                  </span>
                  <button
                    onClick={() => handleCopy(`python -m venv venv\nvenv\\Scripts\\activate.bat\npython -m pip install --upgrade pip\npip install -r requirements.txt\npython main.py`, 'cmd')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Commands
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto">
{`# 1. Open cmd.exe in the project folder
python -m venv venv

# 2. Activate virtual environment
venv\\Scripts\\activate.bat

# 3. Install packages
python -m pip install --upgrade pip
pip install -r requirements.txt

# 4. Start the FastAPI server
python main.py`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                  <FolderTree className="w-4 h-4" /> Project Directory Layout
                </div>
                <pre className="text-slate-300 leading-relaxed">
{`ai-product-bg-remover/
├── main.py                  # FastAPI server with /api/remove-background endpoint
├── requirements.txt         # Pinned packages for Python 3.8 on Windows 7
├── run.bat                  # 1-click batch launcher (auto-venv + browser start)
├── README.md                # Detailed setup & manual commands
└── static/
    └── index.html           # Professional SaaS HTML/CSS/JS frontend`}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <strong className="text-white">main.py</strong>: Validates image upload (JPG/PNG/WebP), loads open-source U²-Net session via ONNX, applies alpha matte via Pillow, returns transparent PNG.
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <strong className="text-white">requirements.txt</strong>: Exact versions of FastAPI (0.95.2), Uvicorn (0.22.0), Pillow (9.5.0), rembg (2.0.38), onnxruntime (1.14.1).
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <strong className="text-white">run.bat</strong>: Windows command script ensuring effortless double-click launch for non-technical users.
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <strong className="text-white">static/index.html</strong>: Lightweight zero-dependency frontend matching the SaaS interface with drag-and-drop & before/after checkerboard.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              {/* File selection bar */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                  {(['main.py', 'requirements.txt', 'run.bat', 'static/index.html'] as const).map((file) => (
                    <button
                      key={file}
                      onClick={() => setActiveCodeFile(file)}
                      className={`px-3 py-1 rounded-md font-mono text-xs transition ${
                        activeCodeFile === file
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {file}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleCopy(getCodeContent(), activeCodeFile)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                >
                  {copiedKey === activeCodeFile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy {activeCodeFile}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code viewer */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[380px]">
                <pre className="text-xs font-mono text-slate-300 whitespace-pre leading-relaxed">
                  {getCodeContent()}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>Zero external paid APIs &bull; 100% Free local machine execution</span>
          <button
            onClick={downloadProjectZip}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Download All Files (.ZIP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
