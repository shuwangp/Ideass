import React, { useState } from 'react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { aiService } from '../../services/aiService';
import { toast } from 'react-hot-toast';

export const AIAssistant = ({ idea, onSuggestionUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [activeTab, setActiveTab] = useState('improve');

  const handleGetSuggestions = async () => {
    if (!idea) return;
    
    setIsLoading(true);
    try {
      const suggestion = await aiService.getIdeaSuggestions({
        title: idea.title,
        description: idea.description,
        category: idea.category,
        priority: idea.priority,
        tags: idea.tags,
      });
      setSuggestions(suggestion);
      toast.success('AI suggestions generated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to get AI suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (field, value) => {
    if (onSuggestionUpdate) {
      onSuggestionUpdate(field, value);
    }
    toast.success(`${field} updated successfully!`);
  };

  const handleAnalyzeConnections = async () => {
    if (!idea?._id) return;
    
    setIsLoading(true);
    try {
      const analysis = await aiService.getRelatedIdeas(idea._id);
      setSuggestions(prev => ({ ...prev, ...analysis }));
      setActiveTab('connections');
      toast.success('AI analysis completed!');
    } catch (error) {
      toast.error(error.message || 'Failed to analyze connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeDevelopment = async () => {
    if (!idea?._id) return;
    
    setIsLoading(true);
    try {
      const analysis = await aiService.getDevelopmentPlan(idea._id);
      setSuggestions(prev => ({ ...prev, ...analysis }));
      setActiveTab('development');
      toast.success('AI development analysis completed!');
    } catch (error) {
      toast.error(error.message || 'Failed to analyze development');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤖</span>
        <h3 className="text-lg font-semibold">AI Assistant</h3>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={handleGetSuggestions}
          disabled={isLoading || !idea}
          isLoading={isLoading && activeTab === 'improve'}
          variant="outline"
          className="flex items-center gap-2"
        >
          ✨ Improve Idea
        </Button>
        
        {idea?._id && (
          <>
            <Button
              onClick={handleAnalyzeConnections}
              disabled={isLoading}
              isLoading={isLoading && activeTab === 'connections'}
              variant="outline"
              className="flex items-center gap-2"
            >
              🔗 Analyze Connections
            </Button>
            
            <Button
              onClick={handleAnalyzeDevelopment}
              disabled={isLoading}
              isLoading={isLoading && activeTab === 'development'}
              variant="outline"
              className="flex items-center gap-2"
            >
              📈 Development Plan
            </Button>
          </>
        )}
      </div>

      {/* Suggestions Display */}
      {suggestions && (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {['improve', 'connections', 'development'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'improve' && '✨ Improve'}
                {tab === 'connections' && '🔗 Connections'}
                {tab === 'development' && '📈 Development'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'improve' && (
              <div className="space-y-4">
                {suggestions.improvedTitle && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Improved Title:</h4>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-800">{suggestions.improvedTitle}</p>
                      <Button
                        size="sm"
                        onClick={() => handleApplySuggestion('title', suggestions.improvedTitle)}
                        className="mt-2"
                      >
                        Apply Title
                      </Button>
                    </div>
                  </div>
                )}

                {suggestions.improvedDescription && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Improved Description:</h4>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {suggestions.improvedDescription}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleApplySuggestion('description', suggestions.improvedDescription)}
                        className="mt-2"
                      >
                        Apply Description
                      </Button>
                    </div>
                  </div>
                )}

                {suggestions.suggestedTags && suggestions.suggestedTags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Suggested Tags:</h4>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {suggestions.suggestedTags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleApplySuggestion('tags', suggestions.suggestedTags)}
                      >
                        Apply Tags
                      </Button>
                    </div>
                  </div>
                )}

                {suggestions.implementationSteps && suggestions.implementationSteps.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Implementation Steps:</h4>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <ol className="list-decimal list-inside space-y-1">
                        {suggestions.implementationSteps.map((step, index) => (
                          <li key={index} className="text-gray-800">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="space-y-4">
                {suggestions.relatedIdeas && suggestions.relatedIdeas.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Related Ideas:</h4>
                    <div className="space-y-2">
                      {suggestions.relatedIdeas.map((idea, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h5 className="font-medium text-blue-900">{idea.title}</h5>
                          <p className="text-sm text-blue-700">{idea.reason}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {idea.connectionType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.potentialCollaborations && suggestions.potentialCollaborations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Potential Collaborations:</h4>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <ul className="list-disc list-inside space-y-1">
                        {suggestions.potentialCollaborations.map((collab, index) => (
                          <li key={index} className="text-gray-800">{collab}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'development' && (
              <div className="space-y-4">
                {suggestions.developmentPhases && suggestions.developmentPhases.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Development Phases:</h4>
                    <div className="space-y-3">
                      {suggestions.developmentPhases.map((phase, index) => (
                        <div key={index} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <h5 className="font-medium text-indigo-900">{phase.phase}</h5>
                          <p className="text-sm text-indigo-700 mb-2">{phase.description}</p>
                          <div className="text-xs text-indigo-600">
                            <span className="font-medium">Timeline:</span> {phase.timeline}
                          </div>
                          {phase.resources && phase.resources.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs font-medium text-indigo-600">Resources:</span>
                              <ul className="text-xs text-indigo-600 list-disc list-inside ml-2">
                                {phase.resources.map((resource, idx) => (
                                  <li key={idx}>{resource}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.technicalRequirements && suggestions.technicalRequirements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technical Requirements:</h4>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <ul className="list-disc list-inside space-y-1">
                        {suggestions.technicalRequirements.map((req, index) => (
                          <li key={index} className="text-gray-800">{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!suggestions && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <p>Click "Improve Idea" to get AI suggestions</p>
        </div>
      )}
    </div>
  );
};


