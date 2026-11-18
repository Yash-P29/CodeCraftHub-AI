import unittest
import json
from app import app
from config import Config

class TestAIService(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_01_health_check(self):
        """Verify /health reports status and provider configuration"""
        res = self.client.get('/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'healthy')
        self.assertEqual(data.get('provider'), 'gemini')
        self.assertTrue(data.get('configured'))
        self.assertIn('...', data.get('maskedKey', ''))
        print("  [PASS] /health reports healthy status and masked key")

    def test_02_validation_errors(self):
        """Verify 400 Bad Request on invalid payloads"""
        # Empty chat
        res = self.client.post('/ai/chat', json={"message": "   "})
        self.assertEqual(res.status_code, 400)
        self.assertFalse(res.get_json()['success'])

        # Missing study plan goal
        res = self.client.post('/ai/study-plan', json={"subject": "React"})
        self.assertEqual(res.status_code, 400)

        # Missing tutor question
        res = self.client.post('/ai/course-tutor', json={"question": ""})
        self.assertEqual(res.status_code, 400)

        # Missing recommendation interests
        res = self.client.post('/ai/recommendations', json={"interests": ""})
        self.assertEqual(res.status_code, 400)
        print("  [PASS] All validation error guards return 400 Bad Request")

    def test_03_live_chat_inference(self):
        """Test real Gemini model inference for AI Learning Assistant"""
        if not Config.is_configured():
            self.skipTest("Gemini API key not configured")

        res = self.client.post('/ai/chat', json={
            "message": "Explain what a REST API is in exactly one concise sentence."
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get('success'))
        response_text = data['data']['response']
        self.assertTrue(len(response_text) > 10)
        print(f"  [PASS] Live Gemini chat inference successful (Model: {data['data']['model']})")
        print(f"         Preview: {response_text.strip()[:90]}...")

    def test_04_live_course_tutor_inference(self):
        """Test real Gemini inference for Course-Aware AI Tutor"""
        if not Config.is_configured():
            self.skipTest("Gemini API key not configured")

        sample_courses = [
            {
                "id": "CRS-101",
                "title": "Full-Stack Web Development with React and Node.js",
                "instructor": "Dr. Sarah Jenkins",
                "category": "Web Development",
                "status": "Active",
                "level": "Intermediate",
                "description": "Master RESTful API architecture, React components, and Node.js servers."
            }
        ]

        res = self.client.post('/ai/course-tutor', json={
            "question": "What is covered in course CRS-101?",
            "courses": sample_courses,
            "courseId": "CRS-101"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get('success'))
        self.assertTrue(len(data['data']['referencedCourses']) > 0)
        print(f"  [PASS] Course-Aware Tutor successfully grounded with CRS-101 metadata")

if __name__ == '__main__':
    print("------------------------------------------------------------")
    print(" Running CodeCraft AI Flask Microservice Test Suite")
    print("------------------------------------------------------------")
    unittest.main(verbosity=2)
