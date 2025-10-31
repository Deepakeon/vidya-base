"use client"
import { ArrowLeft, BookOpen, Video } from 'lucide-react';
import { KnowledgeBase as KnowledgeBaseType } from '@/types';
import ReactMarkdown from 'react-markdown';

interface KnowledgeBaseProps {
  knowledgeBase: KnowledgeBaseType;
  onReset: () => void;
}

export function KnowledgeBase({ knowledgeBase, onReset }: KnowledgeBaseProps) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 p-6 lg:p-8">
      <div className="pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30">
              <BookOpen className="w-7 h-7 text-orange-400" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Knowledge Base
              </h1>
              <p className="text-gray-400 text-base flex items-center gap-2">
                <Video className="w-4 h-4" />
                {knowledgeBase.videoName}
              </p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-8 py-3 bg-[#2a2a2a] hover:bg-[#333333] text-gray-200 rounded-xl font-medium transition-all border border-gray-700 hover:border-gray-600 flex items-center gap-2"
            aria-label="Process new video"
          >
            <ArrowLeft className="w-5 h-5" />
            New Video
          </button>
        </div>
      </div>

      {knowledgeBase.text && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-800">
            <div className="w-1.5 h-8 bg-linear-to-b from-orange-500 to-red-500 rounded-full"></div>
            <h2 className="text-2xl font-semibold text-white">
              Summary
            </h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h3: ({ node, ...props }) => <h3 className='text-xl font-semibold text-white mt-6 mb-2' {...props} />,
                h2: ({ node, ...props }) => <h2 className='text-2xl font-semibold text-white mt-6 mb-2' {...props} />,
                h1: ({ node, ...props }) => <h1 className='text-3xl font-bold text-white mt-6 mb-2' {...props} />,
                p: ({ node, ...props }) => <p className='text-gray-300 leading-relaxed' {...props} />,
                li: ({ node, ...props }) => (
                  <div className="flex gap-3 ml-4">
                    <span className="text-orange-400 mt-1.5">•</span>
                    <div className="text-gray-300 leading-relaxed flex-1" {...(props as React.HTMLAttributes<HTMLParagraphElement>)} />
                  </div>
                ),
              }}
            >
              {knowledgeBase.text}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
