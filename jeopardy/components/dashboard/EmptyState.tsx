import Button from "@/components/ui/Button";

type EmptyStateProps = {
  onCreate: () => void;
};

const EmptyState = ({ onCreate }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <h3>No templates yet</h3>
      <p className="muted">Start by creating your first Jeopardy board.</p>
      <Button onClick={onCreate}>Create new template</Button>
    </div>
  );
};

export default EmptyState;
