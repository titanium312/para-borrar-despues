// loguin-styles.js
import { css } from 'lit';

/* loguin-styles.js */
export default css`
   
     /* ====================================
   * 🎨 SISTEMA DE DISEÑO - TOKENS
   * ==================================== */
  :host {
    /* Paleta de colores - Tema profesional */
    --color-primary-50: #eff6ff;
    --color-primary-100: #dbeafe;
    --color-primary-200: #bfdbfe;
    --color-primary-300: #93c5fd;
    --color-primary-400: #60a5fa;
    --color-primary-500: #3b82f6;
    --color-primary-600: #2563eb;
    --color-primary-700: #1d4ed8;
    --color-primary-800: #1e40af;
    --color-primary-900: #1e3a8a;
    
    /* Grises neutros */
    --color-gray-50: #f9fafb;
    --color-gray-100: #f3f4f6;
    --color-gray-200: #e5e7eb;
    --color-gray-300: #d1d5db;
    --color-gray-400: #9ca3af;
    --color-gray-500: #6b7280;
    --color-gray-600: #4b5563;
    --color-gray-700: #374151;
    --color-gray-800: #1f2937;
    --color-gray-900: #111827;
    
    /* Estados semánticos */
    --color-success-50: #f0fdf4;
    --color-success-500: #10b981;
    --color-success-600: #059669;
    --color-success-700: #047857;
    
    --color-warning-50: #fffbeb;
    --color-warning-500: #f59e0b;
    --color-warning-600: #d97706;
    --color-warning-700: #b45309;
    
    --color-danger-50: #fef2f2;
    --color-danger-500: #ef4444;
    --color-danger-600: #dc2626;
    --color-danger-700: #b91c1c;
    
    --color-info-50: #eff6ff;
    --color-info-500: #3b82f6;
    --color-info-600: #2563eb;
    --color-info-700: #1d4ed8;
    
    /* Aplicación de colores */
    --color-background: #ffffff;
    --color-surface: #ffffff;
    --color-surface-raised: #f9fafb;
    --color-surface-overlay: rgba(0, 0, 0, 0.5);
    --color-border: #e5e7eb;
    --color-border-subtle: #f3f4f6;
    --color-text-primary: #111827;
    --color-text-secondary: #6b7280;
    --color-text-tertiary: #9ca3af;
    --color-text-inverse: #ffffff;
    
    /* Tipografía */
    --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', sans-serif;
    --font-family-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
    
    --font-size-xs: 0.75rem;    /* 12px */
    --font-size-sm: 0.875rem;   /* 14px */
    --font-size-base: 1rem;     /* 16px */
    --font-size-lg: 1.125rem;   /* 18px */
    --font-size-xl: 1.25rem;    /* 20px */
    --font-size-2xl: 1.5rem;    /* 24px */
    --font-size-3xl: 1.875rem;  /* 30px */
    --font-size-4xl: 2.25rem;   /* 36px */
    
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    --line-height-tight: 1.25;
    --line-height-snug: 1.375;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.625;
    --line-height-loose: 2;
    
    /* Espaciado */
    --spacing-0: 0;
    --spacing-1: 0.25rem;   /* 4px */
    --spacing-2: 0.5rem;    /* 8px */
    --spacing-3: 0.75rem;   /* 12px */
    --spacing-4: 1rem;      /* 16px */
    --spacing-5: 1.25rem;   /* 20px */
    --spacing-6: 1.5rem;    /* 24px */
    --spacing-8: 2rem;      /* 32px */
    --spacing-10: 2.5rem;   /* 40px */
    --spacing-12: 3rem;     /* 48px */
    --spacing-16: 4rem;     /* 64px */
    
    /* Bordes y radios */
    --border-width-thin: 1px;
    --border-width-medium: 2px;
    --border-width-thick: 4px;
    
    --radius-none: 0;
    --radius-sm: 0.25rem;
    --radius-base: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-2xl: 1.5rem;
    --radius-full: 9999px;
    
    /* Sombras */
    --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
    
    /* Transiciones */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Z-index */
    --z-base: 0;
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;
    --z-toast: 1080;
  }

  /* ====================================
   * 🔄 RESET Y BASE
   * ==================================== */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :host {
    display: block;
    font-family: var(--font-family-base);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-text-primary);
    background: var(--color-background);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ====================================
   * 📐 LAYOUTS
   * ==================================== */
  .l-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--spacing-6) var(--spacing-4);
    
    @media (min-width: 640px) {
      padding: var(--spacing-8) var(--spacing-6);
    }
    
    @media (min-width: 1024px) {
      padding: var(--spacing-10) var(--spacing-8);
    }
  }

  .l-grid-main {
    display: grid;
    gap: var(--spacing-6);
    margin-top: var(--spacing-8);
    
    @media (min-width: 1024px) {
      grid-template-columns: 1.5fr 1fr;
      gap: var(--spacing-8);
    }
  }

  .l-flex {
    display: flex;
    gap: var(--spacing-4);
  }

  .l-flex--center {
    align-items: center;
    justify-content: center;
  }

  .l-flex--between {
    justify-content: space-between;
  }

  .l-stack {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
  }

  /* ====================================
   * 🎯 COMPONENTES - HEADER
   * ==================================== */
  .c-header {
    text-align: center;
    padding-bottom: var(--spacing-8);
    border-bottom: var(--border-width-thin) solid var(--color-border-subtle);
    margin-bottom: var(--spacing-8);
    animation: fadeInDown var(--transition-slow);
  }

  .c-header__title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-3);
    letter-spacing: -0.025em;
    
    @media (min-width: 640px) {
      font-size: var(--font-size-4xl);
    }
  }

  .c-header__subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: var(--line-height-relaxed);
  }

  /* ====================================
   * 🎯 COMPONENTES - CARDS
   * ==================================== */
  .c-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: var(--border-width-thin) solid var(--color-border);
    padding: var(--spacing-6);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-base);
    animation: fadeInUp var(--transition-slow);
    animation-fill-mode: both;
  }

  .c-card:hover {
    box-shadow: var(--shadow-md);
  }

  .c-card--elevated {
    box-shadow: var(--shadow-lg);
    border: none;
  }

  .c-card--interactive {
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .c-card--interactive:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
  }

  /* ====================================
   * 🎯 COMPONENTES - FORMULARIOS
   * ==================================== */
  .c-field {
    margin-bottom: var(--spacing-5);
  }

  .c-label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-2);
    letter-spacing: 0.025em;
  }

  .c-input,
  .c-select,
  .c-textarea {
    width: 100%;
    padding: var(--spacing-3) var(--spacing-4);
    font-size: var(--font-size-base);
    font-family: inherit;
    color: var(--color-text-primary);
    background: var(--color-surface);
    border: var(--border-width-thin) solid var(--color-border);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    outline: none;
  }

  .c-input:focus,
  .c-select:focus,
  .c-textarea:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .c-input:hover,
  .c-select:hover,
  .c-textarea:hover {
    border-color: var(--color-gray-400);
  }

  .c-textarea {
    min-height: 120px;
    resize: vertical;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
  }

  .c-select {
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right var(--spacing-3) center;
    background-repeat: no-repeat;
    background-size: 20px;
    padding-right: var(--spacing-10);
    appearance: none;
  }

  /* ====================================
   * 🎯 COMPONENTES - BOTONES
   * ==================================== */
  .c-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3) var(--spacing-5);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    font-family: inherit;
    border-radius: var(--radius-md);
    border: var(--border-width-thin) solid transparent;
    cursor: pointer;
    transition: all var(--transition-fast);
    outline: none;
    user-select: none;
    white-space: nowrap;
    text-decoration: none;
    position: relative;
    overflow: hidden;
  }

  .c-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width var(--transition-slow), height var(--transition-slow);
  }

  .c-btn:active::before {
    width: 300px;
    height: 300px;
  }

  .c-btn--primary {
    background: var(--color-primary-600);
    color: var(--color-text-inverse);
    border-color: var(--color-primary-600);
  }

  .c-btn--primary:hover:not(:disabled) {
    background: var(--color-primary-700);
    border-color: var(--color-primary-700);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .c-btn--secondary {
    background: var(--color-surface);
    color: var(--color-text-primary);
    border-color: var(--color-border);
  }

  .c-btn--secondary:hover:not(:disabled) {
    background: var(--color-gray-50);
    border-color: var(--color-gray-300);
  }

  .c-btn--danger {
    background: var(--color-danger-600);
    color: var(--color-text-inverse);
    border-color: var(--color-danger-600);
  }

  .c-btn--danger:hover:not(:disabled) {
    background: var(--color-danger-700);
    border-color: var(--color-danger-700);
  }

  .c-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .c-btn--lg {
    padding: var(--spacing-4) var(--spacing-6);
    font-size: var(--font-size-lg);
  }

  .c-btn--sm {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-sm);
  }

  /* ====================================
   * 🎯 COMPONENTES - CHIPS/TIPOS
   * ==================================== */
  .docTypes {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2);
    margin-top: var(--spacing-3);
  }

  .docTypes__btn {
    padding: var(--spacing-2) var(--spacing-4);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    font-family: inherit;
    color: var(--color-text-secondary);
    background: var(--color-surface);
    border: var(--border-width-thin) solid var(--color-border);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all var(--transition-fast);
    outline: none;
    user-select: none;
    white-space: nowrap;
  }

  .docTypes__btn:hover {
    background: var(--color-gray-50);
    border-color: var(--color-gray-300);
    color: var(--color-text-primary);
  }

  .docTypes__btn[aria-pressed="true"] {
    background: var(--color-primary-600);
    color: var(--color-text-inverse);
    border-color: var(--color-primary-600);
    box-shadow: var(--shadow-sm);
  }

  .docTypes__btn[aria-pressed="true"]:hover {
    background: var(--color-primary-700);
    border-color: var(--color-primary-700);
  }

  /* ====================================
   * 🎯 COMPONENTES - PROGRESS
   * ==================================== */
  .c-progress {
    background: var(--color-gray-50);
    border-radius: var(--radius-md);
    padding: var(--spacing-4);
  }

  .c-progress__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-3);
  }

  .c-progress__title {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .c-progress__stats {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
  }

  .c-progress__bar {
    height: 8px;
    background: var(--color-gray-200);
    border-radius: var(--radius-full);
    overflow: hidden;
    position: relative;
  }

  .c-progress__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
    border-radius: var(--radius-full);
    transition: width var(--transition-base);
    position: relative;
    overflow: hidden;
  }

  .c-progress__fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .c-progress__label {
    margin-top: var(--spacing-2);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  /* ====================================
   * 🎯 COMPONENTES - FILES LIST
   * ==================================== */
  .c-filesList {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
    max-height: 400px;
    overflow-y: auto;
    padding-right: var(--spacing-2);
  }

  .c-filesList::-webkit-scrollbar {
    width: 6px;
  }

  .c-filesList::-webkit-scrollbar-track {
    background: var(--color-gray-100);
    border-radius: var(--radius-full);
  }

  .c-filesList::-webkit-scrollbar-thumb {
    background: var(--color-gray-400);
    border-radius: var(--radius-full);
  }

  .c-filesList::-webkit-scrollbar-thumb:hover {
    background: var(--color-gray-500);
  }

  .c-fileItem {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-3);
    background: var(--color-surface);
    border: var(--border-width-thin) solid var(--color-border);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    animation: slideInLeft var(--transition-base);
  }

  .c-fileItem:hover {
    background: var(--color-gray-50);
    border-color: var(--color-gray-300);
    transform: translateX(4px);
  }

  .c-fileItem__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--color-primary-100);
    color: var(--color-primary-700);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    flex-shrink: 0;
  }

  .c-fileItem__info {
    flex: 1;
    min-width: 0;
  }

  .c-fileItem__name {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .c-fileItem__meta {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    margin-top: 2px;
  }

  /* ====================================
   * 🎯 COMPONENTES - TOASTS
   * ==================================== */
  .c-toasts {
    position: fixed;
    bottom: var(--spacing-6);
    right: var(--spacing-6);
    z-index: var(--z-toast);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
    pointer-events: none;
  }

  .c-toast {
    min-width: 300px;
    max-width: 400px;
    padding: var(--spacing-4);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xl);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    pointer-events: auto;
    animation: slideInRight var(--transition-base);
    border-left: 4px solid var(--color-gray-400);
  }

  .c-toast.--success {
    border-left-color: var(--color-success-600);
    background: linear-gradient(to right, var(--color-success-50), var(--color-surface));
  }

  .c-toast.--error {
    border-left-color: var(--color-danger-600);
    background: linear-gradient(to right, var(--color-danger-50), var(--color-surface));
  }

  .c-toast.--warning {
    border-left-color: var(--color-warning-600);
    background: linear-gradient(to right, var(--color-warning-50), var(--color-surface));
  }

  /* ====================================
   * 🎯 COMPONENTES - UTILITIES
   * ==================================== */
  .c-help {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-top: var(--spacing-2);
    line-height: var(--line-height-relaxed);
  }

  .c-help.--danger {
    color: var(--color-danger-600);
    font-weight: var(--font-weight-medium);
  }

  .c-kbd {
    display: inline-block;
    padding: 2px 6px;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    background: var(--color-gray-100);
    border: var(--border-width-thin) solid var(--color-gray-300);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-xs);
  }

  .c-switch {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    cursor: pointer;
    user-select: none;
  }

  .c-switch input {
    width: 44px;
    height: 24px;
    appearance: none;
    background: var(--color-gray-300);
    border-radius: var(--radius-full);
    position: relative;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .c-switch input::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: var(--radius-full);
    background: var(--color-surface);
    top: 2px;
    left: 2px;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
  }

  .c-switch input:checked {
    background: var(--color-primary-600);
  }

  .c-switch input:checked::after {
    transform: translateX(20px);
  }

  .c-switch span {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .c-actions {
    display: flex;
    gap: var(--spacing-3);
    margin-top: var(--spacing-6);
    padding-top: var(--spacing-6);
    border-top: var(--border-width-thin) solid var(--color-border-subtle);
  }

  .c-sectionTitle {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-4);
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
  }

  /* ====================================
   * 🎯 UTILITIES
   * ==================================== */
  .u-muted {
    color: var(--color-text-secondary);
  }

  .u-small {
    font-size: var(--font-size-sm);
  }

  .u-center {
    text-align: center;
  }

  .u-hidden {
    display: none !important;
  }

  .u-mt-4 { margin-top: var(--spacing-4); }
  .u-mt-6 { margin-top: var(--spacing-6); }
  .u-mt-8 { margin-top: var(--spacing-8); }
  
  .u-mb-4 { margin-bottom: var(--spacing-4); }
  .u-mb-6 { margin-bottom: var(--spacing-6); }
  .u-mb-8 { margin-bottom: var(--spacing-8); }

  /* ====================================
   * 🎬 ANIMACIONES
   * ==================================== */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  /* ====================================
   * 🎯 ESTADOS Y MODIFICADORES
   * ==================================== */
  .is-loading {
    position: relative;
    pointer-events: none;
    opacity: 0.7;
  }

  .is-loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 24px;
    margin: -12px 0 0 -12px;
    border: 3px solid var(--color-primary-200);
    border-top-color: var(--color-primary-600);
    border-radius: var(--radius-full);
    animation: spin 1s linear infinite;
  }

  .is-disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  .is-active {
    background: var(--color-primary-50);
    border-color: var(--color-primary-500);
  }

  .is-error {
    border-color: var(--color-danger-500) !important;
    background: var(--color-danger-50);
  }

  .is-success {
    border-color: var(--color-success-500) !important;
    background: var(--color-success-50);
  }

  /* ====================================
   * 📱 RESPONSIVE HELPERS
   * ==================================== */
  @media (max-width: 639px) {
    .sm\:hidden { display: none !important; }
    .sm\:block { display: block !important; }
    .sm\:flex { display: flex !important; }
  }

  @media (min-width: 640px) {
    .md\:hidden { display: none !important; }
    .md\:block { display: block !important; }
    .md\:flex { display: flex !important; }
    .md\:grid { display: grid !important; }
  }

  @media (min-width: 1024px) {
    .lg\:hidden { display: none !important; }
    .lg\:block { display: block !important; }
    .lg\:flex { display: flex !important; }
    .lg\:grid { display: grid !important; }
  }

  /* ====================================
   * 🌙 TEMA OSCURO (PREPARADO)
   * ==================================== */
  @media (prefers-color-scheme: dark) {
    :host([theme="auto"]) {
      --color-background: #0f172a;
      --color-surface: #1e293b;
      --color-surface-raised: #334155;
      --color-border: #334155;
      --color-border-subtle: #1e293b;
      --color-text-primary: #f1f5f9;
      --color-text-secondary: #cbd5e1;
      --color-text-tertiary: #94a3b8;
    }
  }

  :host([theme="dark"]) {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-surface-raised: #334155;
    --color-border: #334155;
    --color-border-subtle: #1e293b;
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #cbd5e1;
    --color-text-tertiary: #94a3b8;
  }

  /* ====================================
   * 🎨 TEMAS DE COLOR PERSONALIZADOS
   * ==================================== */
  :host([color-scheme="blue"]) {
    --color-primary-500: #3b82f6;
    --color-primary-600: #2563eb;
    --color-primary-700: #1d4ed8;
  }

  :host([color-scheme="green"]) {
    --color-primary-500: #10b981;
    --color-primary-600: #059669;
    --color-primary-700: #047857;
  }

  :host([color-scheme="purple"]) {
    --color-primary-500: #8b5cf6;
    --color-primary-600: #7c3aed;
    --color-primary-700: #6d28d9;
  }

  :host([color-scheme="red"]) {
    --color-primary-500: #ef4444;
    --color-primary-600: #dc2626;
    --color-primary-700: #b91c1c;
  }

  /* ====================================
   * 🖨️ ESTILOS DE IMPRESIÓN
   * ==================================== */
  @media print {
    :host {
      background: white;
      color: black;
    }

    .c-header,
    .c-actions,
    .c-toasts,
    .c-btn,
    .c-switch {
      display: none !important;
    }

    .c-card {
      box-shadow: none;
      border: 1px solid #ddd;
      page-break-inside: avoid;
    }

    .c-filesList {
      max-height: none;
    }
  }

  /* ====================================
   * ♿ ACCESIBILIDAD
   * ==================================== */
  :focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  [aria-busy="true"] {
    cursor: progress;
  }

  [aria-disabled="true"] {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* ====================================
   * 🎯 COMPONENTES ESPECIALES
   * ==================================== */
  
  /* Badge/Contador */
  .c-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 var(--spacing-2);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-inverse);
    background: var(--color-primary-600);
    border-radius: var(--radius-full);
  }

  .c-badge--success {
    background: var(--color-success-600);
  }

  .c-badge--warning {
    background: var(--color-warning-600);
  }

  .c-badge--danger {
    background: var(--color-danger-600);
  }

  /* Divider */
  .c-divider {
    height: var(--border-width-thin);
    background: var(--color-border);
    margin: var(--spacing-6) 0;
  }

  .c-divider--vertical {
    width: var(--border-width-thin);
    height: auto;
    margin: 0 var(--spacing-4);
  }

  /* Skeleton loader */
  .c-skeleton {
    background: linear-gradient(
      90deg,
      var(--color-gray-200) 25%,
      var(--color-gray-100) 50%,
      var(--color-gray-200) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: var(--radius-sm);
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .c-skeleton--text {
    height: 16px;
    margin-bottom: var(--spacing-2);
  }

  .c-skeleton--title {
    height: 24px;
    margin-bottom: var(--spacing-3);
    width: 60%;
  }

  .c-skeleton--button {
    height: 40px;
    width: 120px;
    border-radius: var(--radius-md);
  }

  /* Tooltip */
  [data-tooltip] {
    position: relative;
  }

  [data-tooltip]::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
    padding: var(--spacing-2) var(--spacing-3);
    background: var(--color-gray-900);
    color: var(--color-text-inverse);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-normal);
    white-space: nowrap;
    border-radius: var(--radius-sm);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-fast);
    z-index: var(--z-tooltip);
  }

  [data-tooltip]:hover::after {
    opacity: 1;
  }

  /* ====================================
   * 🎯 LAYOUTS AVANZADOS
   * ==================================== */
  .l-grid {
    display: grid;
    gap: var(--spacing-4);
  }

  .l-grid--2 {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .l-grid--3 {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .l-grid--4 {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .l-sidebar {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: var(--spacing-6);
  }

  @media (max-width: 1023px) {
    .l-sidebar {
      grid-template-columns: 1fr;
    }
  }

  /* ====================================
   * 🎯 EFECTOS ESPECIALES
   * ==================================== */
  .has-glow {
    box-shadow: 
      0 0 20px rgba(59, 130, 246, 0.15),
      0 0 40px rgba(59, 130, 246, 0.1),
      0 0 60px rgba(59, 130, 246, 0.05);
  }

  .has-gradient-border {
    position: relative;
    background: var(--color-surface);
    border: none;
  }

  .has-gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: var(--border-width-thin);
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  /* ====================================
   * 🎯 MEJORAS DE PERFORMANCE
   * ==================================== */
  .will-change-transform {
    will-change: transform;
  }

  .will-change-opacity {
    will-change: opacity;
  }

  .gpu-accelerated {
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* ====================================
   * 🎯 PERSONALIZACIÓN FINAL
   * ==================================== */
  ::selection {
    background: var(--color-primary-200);
    color: var(--color-primary-900);
  }

  ::-moz-selection {
    background: var(--color-primary-200);
    color: var(--color-primary-900);
  }
`;


