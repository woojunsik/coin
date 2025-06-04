import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LikeTooltip = ({ users, show }) => {
  const maxPreview = 2;
  if (!users || users.length === 0 || !show) return null;

  const preview = users.slice(0, maxPreview);
  const extra = users.length - maxPreview;

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-52 bg-white border rounded shadow z-10 text-xs max-h-40 overflow-auto">
      {preview.map((u) => (
        <Link
          key={u._id}
          to={`/user/${u.nickname}`}
          className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100"
        >
          <img src={u.profile || '/default-profile.png'} className="w-5 h-5 rounded-full" alt="user" />
          <span className="text-gray-800">{u.nickname}</span>
        </Link>
      ))}
      {extra > 0 && <div className="px-3 py-1 text-gray-500">외 {extra}명</div>}
    </div>
  );
};

export default LikeTooltip;
