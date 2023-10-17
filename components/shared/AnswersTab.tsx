

import { getUserAnswers } from '@/lib/actions/user.actions';
import { SearchParamsProps } from '@/types';
import React from 'react'
import AnswerCard from '../cards/AnswerCard';
import { Item } from '@radix-ui/react-menubar';


interface Props extends SearchParamsProps {
    userId: string;
    clerkId?: string | null;
}
const AnswersTab = async ({searchProps, userId, clerkId}:Props) => {

    const response = await getUserAnswers({
userId,
page:1,
    })
  return (
    <>
    {response.answers.map((item) => (
        <AnswerCard 
        key={item._id}
        clerkId={clerkId}
        _id ={item._id}
        question={item.question}
        author={item.author}
        upvotes={item.upvotes.length}
        createdAt={item.createdAt}
        />
    ))}
    </>
  )
}

export default AnswersTab
