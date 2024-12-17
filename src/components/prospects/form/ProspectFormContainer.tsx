interface ProspectFormContainerProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const ProspectFormContainer = ({ title, children, onClose }: ProspectFormContainerProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-background rounded-lg p-6 max-w-2xl w-full shadow-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default ProspectFormContainer;