import React from 'react'
import { FiCheck, FiClock, FiEyeOff, FiStar } from 'react-icons/fi'

const StatusBubbleText = ({status ='success',icon, text, size= 'sm', className}) => {
  const statusStyles = {
    disabled: {
      color: "#babac2",
      background: "rgba(186, 186, 194, 0.3)",
      border: "1px solid #babac2",
    },
    success: {
      color: "#43AF7A",
      background: "rgba(67, 175, 122, 0.3)",
      border: "1px solid #43AF7A",
    },
    error: {
      color: "#FD5D5D",
      background: "rgba(253, 93, 93, 0.3)",
      border: "1px solid #FD5D5D",
    },
    warning: {
      color: "#F88A48",
      background: "rgba(248, 138, 72, 0.3)",
      border: "1px solid #F88A48",
    },
  };
    const sizes = {
        sm: 14,
        md: 18,
        lg:24
    }
    const statusIcons = {
        star: <FiStar size={sizes[size]}/>,
        check: <FiCheck size={sizes[size]}/>,
        eyeOff: <FiEyeOff size={sizes[size]}/>,
        clock: <FiClock size={sizes[size]}/>, 

    }
   
  return (
    <span className={`rounded-md px-2 pb-[2px] text-white capitalize text-sm ${className}`}
    style={{
        background: statusStyles[status]?.background,
        border: statusStyles[status]?.border,
        color: statusStyles[status]?.color,
    }}
 

    >{text}</span>
  )
}

export default StatusBubbleText