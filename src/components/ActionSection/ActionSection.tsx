import React, { FC } from "react";

type ActionSectionProps = {
  title?: string;
  onClick: () => void;
  buttonText: string;
  text?: string;
  buttonClassname: string;
  buttonDisabled: boolean;
};

const ActionSection: FC<ActionSectionProps> = ({
  title,
  text,
  onClick,
  buttonText,
  buttonClassname,
  buttonDisabled,
}) => {
  return (
    <div className="px-4 py-5 sm:p-6 flex flex-col">
      <h2 className="text-xl mb-3 leading-6 font-medium text-gray-900">
        {title}
      </h2>
      <div className="mt-2 sm:flex sm:items-center sm:justify-between">
        {text && (
          <div className="max-w-xl text-base text-gray-700">
            <p>{text}</p>
          </div>
        )}
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
          <button
            disabled={buttonDisabled}
            onClick={onClick}
            type="button"
            className={
              "inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm" +
              buttonClassname
            }
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionSection;
