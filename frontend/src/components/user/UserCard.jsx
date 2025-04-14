import React from 'react'
import Avatar from '../common/Avatar'

const UserCard = ({user}) => {
  return (
    <div>
        <Avatar src={user.profilePic} />
        {user.name}
    </div>
  )
}

export default UserCard