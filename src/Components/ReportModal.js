import React from 'react';

function ReportModalContent({
  tab,
  reportModal,
  reportForm,
  reportTextareaRef,
  handleReportTextareaChange,
  handleCloseReportModal,
  handleReportSubmit,
  handleSelectReportParticipant,
}) {
  function getLast4Digits(studentId) {
    if (!studentId || studentId.length < 4) return '';
    return studentId.slice(-4);
  }

  if (tab === 'written' && reportModal.open && !reportModal.selectedParticipant) {
    return (
      <div style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 16 }}>참여자 선택</h3>
        {reportModal.participants.map(participant => (
          <div
            key={participant.userId}
            style={{
              padding: 12,
              marginBottom: 8,
              border: '1px solid #eee',
              borderRadius: 8,
              cursor: 'pointer',
            }}
            onClick={() => handleSelectReportParticipant(participant)}
          >
            {participant.displayName}
            {participant.studentId && ` (${getLast4Digits(participant.studentId)})`}
          </div>
        ))}
      </div>
    );
  }
  if (
    (tab === 'written' && reportModal.selectedParticipant) ||
    (tab === 'participated' && reportModal.selectedParticipant)
  ) {
    const target = reportModal.selectedParticipant;
    return (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0',
            background: '#fff',
          }}
        >
          <button
            onClick={handleCloseReportModal}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              marginRight: 12,
              color: '#333',
              padding: 0,
            }}
            aria-label="뒤로가기"
          >
            ←
          </button>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#d32f2f',
            }}
          >
            {tab === 'written' ? '참여자 신고하기' : '판매자 신고하기'}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#fff3f3',
            borderRadius: 12,
            padding: 12,
            margin: 20,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: '#d32f2f',
            }}
          >
            {target.displayName}
            {target.studentId && ` (${getLast4Digits(target.studentId)})`}
          </div>
        </div>
        <form onSubmit={handleReportSubmit} style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: '#333',
            }}
          >
            신고 사유
          </div>
          <textarea
            ref={reportTextareaRef}
            value={reportForm.reason}
            onChange={handleReportTextareaChange}
            placeholder="신고 사유를 입력해 주세요."
            style={{
              width: '100%',
              minHeight: 80,
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              padding: 12,
              fontSize: 14,
              marginBottom: 12,
              boxSizing: 'border-box',
              resize: 'vertical',
              lineHeight: '1.4',
              fontFamily: 'inherit',
              background: '#fff',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button
              type="button"
              onClick={handleCloseReportModal}
              style={{
                flex: 1,
                background: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: 8,
                padding: '14px 0',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                background: '#d32f2f',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '14px 0',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              신고하기
            </button>
          </div>
        </form>
      </div>
    );
  }
  return null;
}

export default ReportModalContent;
