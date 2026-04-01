const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {skeletonMessages.map((_, index) => (
        <div
          key={index}
          className={`chat ${index % 2 === 0 ? "chat-start" : "chat-end"}`}
        >
          <div className="chat-image avatar">
            <div className="size-10 rounded-full skeleton" />
          </div>
          <div className="chat-header mb-1">
            <div className="skeleton h-3 w-16" />
          </div>
          <div className="chat-bubble bg-transparent p-0 shadow-none">
            <div className="skeleton h-12 w-48 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
