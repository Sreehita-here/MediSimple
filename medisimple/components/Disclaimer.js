export default function Disclaimer({ className = "" }) {
  return (
    <div className={`disclaimer ${className}`} role="note">
      <span className="disclaimer-icon">⚠️</span>
      <span>
        <strong>Educational Information Only:</strong> This information is for educational
        purposes only and does not constitute medical advice. Always ask your doctor for
        medical decisions. Never change your dose or stop taking a medicine without
        consulting your healthcare provider.
      </span>
    </div>
  );
}
