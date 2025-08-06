import React from 'react';
import { Users, FolderOpen, Calendar } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ja } from 'date-fns/locale';
import { addMonths, subMonths, startOfMonth } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

// 日本語ロケールを登録
registerLocale('ja', ja);

interface FilterPanelProps {
  users: string[];
  projects: {key: string; name: string}[];
  selectedUsers: string[];
  selectedProjects: string[];
  startDate: string;
  onUserChange: (users: string[]) => void;
  onProjectChange: (projects: string[]) => void;
  onStartDateChange: (date: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  users,
  projects,
  selectedUsers,
  selectedProjects,
  startDate,
  onUserChange,
  onProjectChange,
  onStartDateChange
}) => {
  const handleQuickDateSelect = (type: 'today' | 'prevMonth' | 'nextMonth') => {
    const currentDate = new Date(startDate);
    let targetDate: Date;

    switch (type) {
      case 'today':
        targetDate = new Date();
        break;
      case 'prevMonth':
        targetDate = startOfMonth(subMonths(currentDate, 1));
        break;
      case 'nextMonth':
        targetDate = startOfMonth(addMonths(currentDate, 1));
        break;
    }

    // ローカル時間での日付文字列を生成（UTC変換を回避）
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;
    
    onStartDateChange(localDateString);
  };
  const handleUserSelect = (user: string) => {
    onUserChange([user]);
  };

  const handleSelectAllUsers = () => {
    onUserChange(users);
  };

  const handleProjectToggle = (projectKey: string) => {
    if (selectedProjects.includes(projectKey)) {
      onProjectChange(selectedProjects.filter(p => p !== projectKey));
    } else {
      onProjectChange([...selectedProjects, projectKey]);
    }
  };

  const handleSelectAllProjects = () => {
    if (selectedProjects.length === projects.length) {
      onProjectChange([]);
    } else {
      onProjectChange(projects.map(p => p.key));
    }
  };

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <div className="filter-header">
          <Calendar size={20} />
          <h3>表示開始日</h3>
        </div>
        <div className="date-input-container">
          <DatePicker
            selected={new Date(startDate)}
            onChange={(date) => {
              if (date) {
                onStartDateChange(date.toISOString().split('T')[0]);
              }
            }}
            dateFormat="yyyy年MM月dd日"
            className="date-input"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            placeholderText="日付を選択"
            locale="ja"
          />
          <div className="quick-date-buttons">
            <button 
              className="quick-date-btn quick-date-btn--today"
              onClick={() => handleQuickDateSelect('today')}
            >
              今日
            </button>
            <button 
              className="quick-date-btn quick-date-btn--nav"
              onClick={() => handleQuickDateSelect('prevMonth')}
            >
              前月
            </button>
            <button 
              className="quick-date-btn quick-date-btn--nav"
              onClick={() => handleQuickDateSelect('nextMonth')}
            >
              次月
            </button>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <Users size={20} />
          <h3>担当者</h3>
        </div>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="radio"
              name="user-filter"
              checked={selectedUsers.length === users.length}
              onChange={handleSelectAllUsers}
            />
            <span className="option-text">全員</span>
          </label>
          {users.map(user => (
            <label key={user} className="filter-option">
              <input
                type="radio"
                name="user-filter"
                checked={selectedUsers.length === 1 && selectedUsers.includes(user)}
                onChange={() => handleUserSelect(user)}
              />
              <span className="option-text">{user}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <FolderOpen size={20} />
          <h3>プロジェクト</h3>
          <button 
            className="select-all-btn"
            onClick={handleSelectAllProjects}
          >
            {selectedProjects.length === projects.length ? '全解除' : '全選択'}
          </button>
        </div>
        <div className="filter-options">
          {projects.map(project => (
            <label key={project.key} className="filter-option">
              <input
                type="checkbox"
                checked={selectedProjects.includes(project.key)}
                onChange={() => handleProjectToggle(project.key)}
              />
              <span className="checkmark"></span>
              <span className="option-text">
                <span className="project-key">[{project.key}]</span>
                <span className="project-name">{project.name}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;