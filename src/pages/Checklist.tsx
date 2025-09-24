import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useTranslation } from 'react-i18next';
import { getScanData, saveScanData } from '../lib/storage';

const rooms = [
  { id: 'windows', icon: '🪟', tips: ['Check for gaps around frames', 'Look for cracked or broken seals', 'Test if windows close tightly'] },
  { id: 'doors', icon: '🚪', tips: ['Check door seals and weatherstripping', 'Look for daylight around closed doors', 'Test door latches and locks'] },
  { id: 'kitchen', icon: '🍳', tips: ['Check appliance energy ratings', 'Look for old incandescent bulbs', 'Check refrigerator door seals'] },
  { id: 'bathroom', icon: '🚿', tips: ['Check for drafts around exhaust fans', 'Look for old shower heads', 'Check hot water system efficiency'] },
  { id: 'attic', icon: '🏠', tips: ['Check insulation levels', 'Look for air leaks', 'Check ventilation adequacy'] },
  { id: 'appliances', icon: '📺', tips: ['Note energy star ratings', 'Check age of major appliances', 'Look for standby power usage'] }
];

export function Checklist() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('scanId');
  
  const [checklist, setChecklist] = useState<Record<string, { completed: boolean; notes: string; photos: string[] }>>({});
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  useEffect(() => {
    if (!scanId) {
      navigate('/scan');
      return;
    }
    
    // Load existing checklist data
    getScanData(scanId).then(scanData => {
      if (scanData?.checklist) {
        setChecklist(scanData.checklist);
      }
    });
  }, [scanId, navigate]);

  const handleRoomComplete = (roomId: string, notes: string) => {
    const updatedChecklist = {
      ...checklist,
      [roomId]: {
        completed: true,
        notes,
        photos: checklist[roomId]?.photos || []
      }
    };
    
    setChecklist(updatedChecklist);
    setCurrentRoom(null);
    
    // Save to storage
    if (scanId) {
      getScanData(scanId).then(scanData => {
        if (scanData) {
          saveScanData({
            ...scanData,
            checklist: updatedChecklist
          });
        }
      });
    }
  };

  const handleContinue = () => {
    if (scanId) {
      navigate(`/survey?scanId=${scanId}`);
    }
  };

  const completedRooms = Object.values(checklist).filter(room => room.completed).length;
  const progress = (completedRooms / rooms.length) * 100;

  if (currentRoom) {
    const room = rooms.find(r => r.id === currentRoom);
    if (!room) return null;

    return (
      <RoomDetail
        room={room}
        existingData={checklist[currentRoom]}
        onComplete={(notes) => handleRoomComplete(currentRoom, notes)}
        onBack={() => setCurrentRoom(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(`/scan`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{t('checklist.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {completedRooms} of {rooms.length} rooms completed
            </p>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Room Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {rooms.map((room) => {
            const isCompleted = checklist[room.id]?.completed || false;
            
            return (
              <Card 
                key={room.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isCompleted ? 'ring-2 ring-green-200 bg-green-50' : ''
                }`}
                onClick={() => setCurrentRoom(room.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{room.icon}</span>
                      <span className="text-lg">{t(`checklist.rooms.${room.id}`)}</span>
                    </div>
                    {isCompleted && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {isCompleted 
                      ? 'Completed ✓' 
                      : `${room.tips.length} items to check`
                    }
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        {completedRooms === rooms.length && (
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Checklist Complete!</h3>
              <p className="text-muted-foreground mb-4">
                Great job! You've completed the room-by-room checklist. 
                Now let's gather some additional information about your home.
              </p>
              <Button onClick={handleContinue}>
                Continue to Survey
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RoomDetail({ 
  room, 
  existingData, 
  onComplete, 
  onBack 
}: {
  room: typeof rooms[0];
  existingData?: { completed: boolean; notes: string; photos: string[] };
  onComplete: (notes: string) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState(existingData?.notes || '');
  const [checkedTips, setCheckedTips] = useState<Set<number>>(new Set());

  const handleTipCheck = (index: number) => {
    const newChecked = new Set(checkedTips);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedTips(newChecked);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">{room.icon}</span>
              {t(`checklist.rooms.${room.id}`)}
            </h1>
          </div>
        </div>

        {/* Tips Checklist */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Inspection Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {room.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`tip-${index}`}
                  checked={checkedTips.has(index)}
                  onChange={() => handleTipCheck(index)}
                  className="mt-1"
                />
                <label htmlFor={`tip-${index}`} className="text-sm flex-1">
                  {tip}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notes & Observations</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any observations, issues found, or additional notes..."
              className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </CardContent>
        </Card>

        {/* Photo Capture */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Photos (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Take Photos
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Photos help document issues and can be included in your report
            </p>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <Button 
          onClick={() => onComplete(notes)} 
          className="w-full"
          disabled={checkedTips.size === 0}
        >
          Complete {t(`checklist.rooms.${room.id}`)} Inspection
        </Button>
      </div>
    </div>
  );
}