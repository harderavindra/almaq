const TaskCardSkeleton = () => {
    return (
        <div className="border border-gray-200 rounded-2xl p-4 flex justify-between items-start animate-pulse">
            <div className="space-y-2 animate-pulse">
                <div className="h-7 w-64 bg-gray-200 rounded" />
                <div className="flex gap-3 items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    <div className="space-y-1">
                        <div className="h-3 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-xl space-y-4 animate-pulse">
                <div className="h-5 w-48 bg-gray-200 rounded" />
                <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-5/6 bg-gray-200 rounded" />
                    <div className="h-3 w-4/6 bg-gray-200 rounded" />
                </div>
                <div className="h-3 w-40 bg-gray-200 rounded" />
            </div>
            <div className="border border-gray-200 rounded-2xl p-4 flex justify-between items-start animate-pulse">
                <div className="space-y-3 w-full">
                    <div className="flex gap-4">
                        <div className="h-4 w-36 bg-gray-200 rounded" />
                        <div className="h-4 w-28 bg-gray-200 rounded" />
                    </div>
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-300" />
            </div>

        </div>
    );
};

export default TaskCardSkeleton;
