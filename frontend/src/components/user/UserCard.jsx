import React from 'react'
import Avatar from '../common/Avatar'
import StatusBubbleText from '../common/StatusBubbleText'

const UserCard = ({user}) => {
  return (
    <div className='flex gap-5 px-5 py-2 border-b border-gray-200 items-start justify-between'>
      <div className='flex gap-5'>
        <Avatar size='md' src={user.profilePic} />
        <div className='flex flex-col justify-center'>
        <p className='leading-none capitalize text-lg'>{user.name}</p>
        <p className='leading-none text-gray-400'>{user.email}</p>

        </div>
        </div>
        <StatusBubbleText status='success' size='md' icon={user} text={user.role} />
    </div>
  )
}

export default UserCard