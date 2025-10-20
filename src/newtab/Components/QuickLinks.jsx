import React, { useState, useEffect } from "react";

const QuickLinks = () => {
  const defaultLinks = [
    {
      id: "default-1",
      href: "https://github.com",
      icon: "/icons/github_icon.png",
      label: "GitHub",
      hoverColor: "hover:border-purple-500",
      isImage: true,
      isDefault: true,
    },
  ];

  const [customLinks, setCustomLinks] = useState([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    label: "",
    href: "",
    icon: "",
    hoverColor: "hover:border-blue-500",
  });

  // Load custom links from Chrome storage
  useEffect(() => {
    chrome.storage.sync.get(["customQuickLinks"], (result) => {
      if (result.customQuickLinks) {
        setCustomLinks(result.customQuickLinks);
      }
    });

    // Listen for changes from other components
    const handleStorageChange = (changes, area) => {
      if (area === "sync" && changes.customQuickLinks) {
        setCustomLinks(changes.customQuickLinks.newValue || []);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Save custom links to Chrome storage
  const saveCustomLinks = (links) => {
    chrome.storage.sync.set({ customQuickLinks: links });
    setCustomLinks(links);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = "Label is required";
    }

    if (!formData.href.trim()) {
      newErrors.href = "URL is required";
    } else {
      // Basic URL validation
      try {
        new URL(formData.href);
      } catch (e) {
        newErrors.href = "Please enter a valid URL (e.g., https://example.com)";
      }
    }

    if (!formData.icon.trim()) {
      newErrors.icon = "Icon is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddLink = () => {
    if (!validateForm()) {
      return;
    }

    const newLink = {
      id: `custom-${Date.now()}`,
      ...formData,
      isImage: false,
      isDefault: false,
    };
    const updatedLinks = [...customLinks, newLink];
    saveCustomLinks(updatedLinks);
    resetForm();
  };

  const handleUpdateLink = () => {
    if (!validateForm()) {
      return;
    }

    if (editingLink) {
      const updatedLinks = customLinks.map((link) =>
        link.id === editingLink.id ? { ...link, ...formData } : link
      );
      saveCustomLinks(updatedLinks);
      resetForm();
    }
  };

  const handleDeleteLink = (linkId) => {
    const updatedLinks = customLinks.filter((link) => link.id !== linkId);
    saveCustomLinks(updatedLinks);
  };

  const startEditing = (link) => {
    setEditingLink(link);
    setFormData({
      label: link.label,
      href: link.href,
      icon: link.icon,
      hoverColor: link.hoverColor,
    });
    setIsAddingLink(true);
  };

  const resetForm = () => {
    setFormData({
      label: "",
      href: "",
      icon: "",
      hoverColor: "hover:border-blue-500",
    });
    setErrors({});
    setIsAddingLink(false);
    setEditingLink(null);
  };

  const allLinks = [...defaultLinks, ...customLinks];

  return (
    <div className="mt-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-indigo-300">Quick Links</h3>
        <button
          onClick={() => setIsAddingLink(!isAddingLink)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm transition"
        >
          {isAddingLink ? "✕ Cancel" : "+ Add Link"}
        </button>
      </div>

      {/* Add/Edit Link Form */}
      {isAddingLink && (
        <div className="bg-[#1b1b22] p-4 rounded-lg border border-gray-800 mb-4">
          <h4 className="text-white font-medium mb-3">
            {editingLink ? "Edit Link" : "Add New Link"}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Label *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => {
                  setFormData({ ...formData, label: e.target.value });
                  if (errors.label) setErrors({ ...errors, label: "" });
                }}
                placeholder="e.g., Twitter"
                className={`w-full bg-[#2b2b33] text-white px-3 py-2 rounded-lg text-sm border ${
                  errors.label ? "border-red-500" : "border-gray-600"
                } focus:border-indigo-500 focus:outline-none`}
              />
              {errors.label && (
                <p className="text-red-400 text-xs mt-1">{errors.label}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">URL *</label>
              <input
                type="url"
                value={formData.href}
                onChange={(e) => {
                  setFormData({ ...formData, href: e.target.value });
                  if (errors.href) setErrors({ ...errors, href: "" });
                }}
                placeholder="https://example.com"
                className={`w-full bg-[#2b2b33] text-white px-3 py-2 rounded-lg text-sm border ${
                  errors.href ? "border-red-500" : "border-gray-600"
                } focus:border-indigo-500 focus:outline-none`}
              />
              {errors.href && (
                <p className="text-red-400 text-xs mt-1">{errors.href}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Icon (Emoji) *
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => {
                  setFormData({ ...formData, icon: e.target.value });
                  if (errors.icon) setErrors({ ...errors, icon: "" });
                }}
                placeholder="🔗"
                maxLength="2"
                className={`w-full bg-[#2b2b33] text-white px-3 py-2 rounded-lg text-sm border ${
                  errors.icon ? "border-red-500" : "border-gray-600"
                } focus:border-indigo-500 focus:outline-none`}
              />
              {errors.icon && (
                <p className="text-red-400 text-xs mt-1">{errors.icon}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Hover Color
              </label>
              <div className="relative">
                <select
                  value={formData.hoverColor}
                  onChange={(e) =>
                    setFormData({ ...formData, hoverColor: e.target.value })
                  }
                  className="w-full bg-[#2b2b33] text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="hover:border-blue-500">Blue</option>
                  <option value="hover:border-indigo-500">Indigo</option>
                  <option value="hover:border-purple-500">Purple</option>
                  <option value="hover:border-pink-500">Pink</option>
                  <option value="hover:border-red-500">Red</option>
                  <option value="hover:border-orange-500">Orange</option>
                  <option value="hover:border-yellow-500">Yellow</option>
                  <option value="hover:border-green-500">Green</option>
                  <option value="hover:border-teal-500">Teal</option>
                  <option value="hover:border-cyan-500">Cyan</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={editingLink ? handleUpdateLink : handleAddLink}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                {editingLink ? "Update Link" : "Add Link"}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {allLinks.map((link) => (
          <div key={link.id} className="relative group">
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`block bg-[#1b1b22] hover:bg-[#2b2b33] p-3 rounded-lg border border-gray-800 ${link.hoverColor} transition text-center`}
            >
              <div className="text-2xl mb-1">
                {link.isImage ? (
                  <img
                    src={link.icon}
                    alt={link.label}
                    className="w-8 h-8 mx-auto"
                  />
                ) : (
                  link.icon
                )}
              </div>
              <p className="text-white font-medium text-sm">{link.label}</p>
            </a>

            {/* Edit/Delete buttons for custom links */}
            {!link.isDefault && (
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    startEditing(link);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (
                      confirm(
                        `Are you sure you want to delete "${link.label}"?`
                      )
                    ) {
                      handleDeleteLink(link.id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;
