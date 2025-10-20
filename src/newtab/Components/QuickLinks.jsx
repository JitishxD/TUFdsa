import React from "react";

const QuickLinks = () => {
  const links = [
    {
      href: "https://leetcode.com",
      icon: "💻",
      label: "LeetCode",
      hoverColor: "hover:border-indigo-500",
    },
    {
      href: "https://github.com",
      icon: "🐙",
      label: "GitHub",
      hoverColor: "hover:border-purple-500",
    },
    {
      href: "https://stackoverflow.com",
      icon: "📚",
      label: "Stack Overflow",
      hoverColor: "hover:border-yellow-500",
    },
    {
      href: "https://www.youtube.com",
      icon: "🎥",
      label: "YouTube",
      hoverColor: "hover:border-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className={`bg-[#1b1b22] hover:bg-[#2b2b33] p-3 rounded-lg border border-gray-800 ${link.hoverColor} transition text-center`}
        >
          <div className="text-2xl mb-1">{link.icon}</div>
          <p className="text-white font-medium text-sm">{link.label}</p>
        </a>
      ))}
    </div>
  );
};

export default QuickLinks;
