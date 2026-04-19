interface LeadDetailFieldProps {
  label: string;
  value: string;
}

const LeadDetailField = ({ label, value }: LeadDetailFieldProps) => {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
};

export default LeadDetailField;
