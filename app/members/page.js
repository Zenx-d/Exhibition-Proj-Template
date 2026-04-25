import { getAllActiveMembers, getProjectsByMemberId } from '../../utils/dataLoader';
import MembersClient from '../../components/MembersClient';

export const metadata = {
  title: 'Members | Zen Exhibition',
  description: 'Meet the brilliant minds behind the exhibition projects.',
};

export default function MembersPage() {
  const members = getAllActiveMembers();
  
  // Pre-calculate project counts
  const projectCountMap = {};
  members.forEach(member => {
    projectCountMap[member.id] = getProjectsByMemberId(member.id).length;
  });

  return (
    <MembersClient initialMembers={members} projectCountMap={projectCountMap} />
  );
}
