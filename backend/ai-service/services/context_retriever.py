import re
from typing import List, Dict, Any

class ContextRetriever:
    """Intelligent context filter and ranker for course-aware tutoring and recommendations"""

    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        """Extract alphanumeric keywords longer than 2 characters"""
        if not text:
            return []
        tokens = re.findall(r'\b[a-zA-Z0-9_\+#\.\-]{3,}\b', text.lower())
        # Filter common stopwords
        stopwords = {
            'the', 'and', 'for', 'with', 'what', 'how', 'can', 'explain',
            'this', 'that', 'from', 'about', 'course', 'learn', 'which',
            'should', 'where', 'when', 'does', 'have', 'been', 'would'
        }
        return [t for t in tokens if t not in stopwords]

    @classmethod
    def find_relevant_courses(cls, query: str, courses: List[Dict[str, Any]], top_k: int = 4) -> List[Dict[str, Any]]:
        """Rank courses based on keyword match in title, description, instructor, and category"""
        if not courses:
            return []

        keywords = cls.extract_keywords(query)
        if not keywords:
            # Return active courses if no specific keywords
            return [c for c in courses if c.get('status') == 'Active'][:top_k]

        scored = []
        for course in courses:
            score = 0
            title = (course.get('title') or '').lower()
            desc = (course.get('description') or '').lower()
            cat = (course.get('category') or '').lower()
            instr = (course.get('instructor') or '').lower()
            cid = (course.get('id') or '').lower()

            for kw in keywords:
                if kw in cid:
                    score += 15  # Direct ID reference
                if kw in title:
                    score += 8   # Title match
                if kw in cat:
                    score += 5   # Category match
                if kw in desc:
                    score += 2   # Description match
                if kw in instr:
                    score += 3   # Instructor match

            if score > 0:
                scored.append((score, course))

        # Sort descending by score
        scored.sort(key=lambda x: x[0], reverse=True)

        # If matches found, return top_k
        if scored:
            return [c for _, c in scored[:top_k]]

        # Fallback to general active courses
        return [c for c in courses if c.get('status') == 'Active'][:top_k]

    @classmethod
    def format_courses_for_prompt(cls, courses: List[Dict[str, Any]]) -> str:
        """Format course metadata cleanly for LLM system prompt context"""
        if not courses:
            return "No matching courses currently available in the catalog."

        lines = []
        for idx, c in enumerate(courses, 1):
            lines.append(
                f"Course #{idx} [ID: {c.get('id', 'N/A')}]:\n"
                f"  - Title: {c.get('title', 'Untitled')}\n"
                f"  - Instructor: {c.get('instructor', 'Unknown')}\n"
                f"  - Category: {c.get('category', 'General')}\n"
                f"  - Status: {c.get('status', 'Active')}\n"
                f"  - Difficulty Level: {c.get('level', 'Intermediate')}\n"
                f"  - Duration: {c.get('duration', 'Self-Paced')}\n"
                f"  - Enrolled Learners: {c.get('enrolledStudents', 0)}\n"
                f"  - Rating: {c.get('rating', 5.0)} / 5.0\n"
                f"  - Summary: {c.get('description', '')}\n"
            )
        return "\n".join(lines)
