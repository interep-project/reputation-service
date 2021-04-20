import React, { FC } from "react";

type ActionPanelProps = {
  title?: string;
  onClick: () => void;
  buttonText: string;
  text?: string;
};

const ActionPanel: FC<ActionPanelProps> = ({
  title,
  text,
  onClick,
  buttonText,
}) => {
  return (
    <div className="max-w-lg mx-auto bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6 flex flex-col items-center">
        <h3 className="text-lg mb-3 leading-6 font-medium text-gray-900">
          {title}
        </h3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          {text && (
            <div className="max-w-xl text-sm text-gray-500">
              <p>{text}</p>
            </div>
          )}
          <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
            <button
              onClick={onClick}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;
