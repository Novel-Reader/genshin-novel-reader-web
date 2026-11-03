import exampleObj from "./example.json";
import File from '../model/file';
import { PARAGRAPHS } from './constants';

/**
 * parse text file to html dom
 * @param {string} txt
 * @return {doms}
 */
const parseTxtToHTML = (txt) => {
  return txt.split("\n").filter((item) => item.trim().length > 0);
};

const isSameObject = (a, b) => {
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (!a || !b) return false;
  let k;
  for (k in a) {
    if (Object.prototype.hasOwnProperty.call(a, k)) {
      if (typeof a[k] === "function" && typeof b[k] === "function") {
        continue;
      }
      if (!Object.prototype.hasOwnProperty.call(b, k) || a[k] !== b[k]) {
        return false;
      }
    }
  }
  for (k in b) {
    if (
      Object.prototype.hasOwnProperty.call(b, k) &&
      !Object.prototype.hasOwnProperty.call(a, k)
    ) {
      return false;
    }
  }
  return true;
};

const MenuSelectStyle = {
  option: (provided, state) => {
    const { isDisabled } = state;
    return {
      ...provided,
      cursor: isDisabled ? "default" : "pointer",
    };
  },
  control: (provided) => ({
    ...provided,
    fontSize: "14px",
    cursor: "pointer",
    lineHeight: "1.5",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  indicatorSeparator: () => {},
};

const loadExample = () => {
  const files = [];
  for (const name in exampleObj) {
    const file = new File({
      name: name,
      detail: exampleObj[name],
    });
    files.push(file);
  }
  return files;
};

const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789';

const generatorBase64Code = (keyLength = 4) => {
  let key = '';
  for (let i = 0; i < keyLength; i++) {
    key += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return key;
};

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const getName = (file) => (file.name || 'novel').replace(/[<>:"/\\|?*]/g, '_').split('').map((c) => c.charCodeAt(0) < 32 ? '_' : c).join('');

const exportTxtFile = (file) => {
  const content = Array.isArray(file.detail) ? file.detail.join(file.type === PARAGRAPHS ? '\n\n' : '') : file.detail;
  if (typeof content !== 'string') return;
  const filename = getName(file);
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const exportPdfFile = async (file) => {
  const content = Array.isArray(file.detail) ? file.detail.join(file.type === PARAGRAPHS ? '\n\n' : '') : file.detail;
  if (typeof content !== 'string') return;

  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true });
  const canvas = document.createElement('canvas');
  const scale = 2;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 96;
  const lineHeight = 36;
  canvas.width = pageWidth * scale;
  canvas.height = pageHeight * scale;
  const context = canvas.getContext('2d');
  if (!context) return;

  const maxWidth = canvas.width - margin * 2;
  const bottom = canvas.height - margin;
  let y = margin;
  let pageHasContent = false;

  const resetPage = () => {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000000';
    context.font = '24px Arial, sans-serif';
    context.textBaseline = 'top';
    y = margin;
    pageHasContent = false;
  };

  const savePage = () => {
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageWidth, pageHeight);
    pageHasContent = true;
  };

  const writeLine = (line) => {
    if (y + lineHeight > bottom) {
      savePage();
      pdf.addPage();
      resetPage();
    }
    context.fillText(line, margin, y);
    y += lineHeight;
    pageHasContent = true;
  };

  resetPage();
  content.split(/\r?\n/).forEach((paragraph) => {
    if (!paragraph) {
      writeLine('');
      return;
    }
    let line = '';
    Array.from(paragraph).forEach((character) => {
      if (line && context.measureText(line + character).width > maxWidth) {
        writeLine(line);
        line = character;
      } else {
        line += character;
      }
    });
    writeLine(line);
  });

  if (pageHasContent) savePage();
  pdf.save(`${getName(file)}.pdf`);
};

export {
  parseTxtToHTML,
  isSameObject,
  MenuSelectStyle,
  loadExample,
  generatorBase64Code,
  isMobile,
  exportTxtFile,
  exportPdfFile,
};
