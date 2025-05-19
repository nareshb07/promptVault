// components/Icon.js
import React from 'react';
import { FiCopy } from 'react-icons/fi';
import { AiOutlinePlus } from 'react-icons/ai';
import { IoCheckmarkOutline } from "react-icons/io5";
import { LuArrowBigUp,LuArrowBigDown  } from "react-icons/lu";
import { CiSearch } from "react-icons/ci";
const icons = {
  copy: FiCopy,
  plus: AiOutlinePlus,
  check: IoCheckmarkOutline,
  arrowUp: LuArrowBigUp,
  arrowDown: LuArrowBigDown,
  search: CiSearch 
};

const Icon = ({ name, className = "h-5 w-5" }) => {
  const IconComponent = icons[name];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export default Icon;