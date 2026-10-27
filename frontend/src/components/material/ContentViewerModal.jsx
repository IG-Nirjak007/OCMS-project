import React from 'react';
import { downloadAuthenticatedFile } from '../../utils/fileDownloader';

const ContentViewerModal = ({ material, onClose }) => {
  if (!material) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(24, 32, 43, 0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid #e8edf2',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(24, 32, 43, 0.18)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e8edf2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafbfc',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📖</span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary, #18202b)' }}>
                {material.title}
              </h3>
              <span
                style={{
                  background: 'rgba(84, 198, 184, 0.14)',
                  color: 'var(--accent-dark, #42b3a5)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {material.contentType || 'In-DB Content'}
              </span>
            </div>
            {material.contentDescription && (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted, #526071)' }}>
                {material.contentDescription}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--text-muted, #526071)',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              lineHeight: 1,
              borderRadius: 'var(--radius)',
            }}
            title="Close viewer"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            lineHeight: 1.7,
            color: 'var(--text, #18202b)',
            fontSize: '0.95rem',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            background: '#ffffff',
          }}
        >
          {material.contentData ? (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {material.contentData}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted, #526071)', fontStyle: 'italic' }}>
              No text content stored in database for this material.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e8edf2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafbfc',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #526071)' }}>
            Stored in PostgreSQL DB • Accessible anytime
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {material.filePath && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => downloadAuthenticatedFile(`/materials/${material.id}/download`, material.title)}
              >
                📥 Download Attachment
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onClose}
              style={{ background: 'var(--accent, #54c6b8)', border: 'none', borderRadius: '9999px', padding: '0.5rem 1.25rem' }}
            >
              Done Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentViewerModal;
