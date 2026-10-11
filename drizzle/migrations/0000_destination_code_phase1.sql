-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'python',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- PROBLEMS
CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  topic TEXT NOT NULL,
  input_format TEXT NOT NULL DEFAULT '',
  output_format TEXT NOT NULL DEFAULT '',
  constraints TEXT NOT NULL DEFAULT '',
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.problems TO anon;
GRANT SELECT ON public.problems TO authenticated;
GRANT ALL ON public.problems TO service_role;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Problems are publicly readable" ON public.problems FOR SELECT TO anon, authenticated USING (true);

-- PROGRESS
CREATE TABLE public.problem_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'attempted',
  last_opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, problem_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.problem_progress TO authenticated;
GRANT ALL ON public.problem_progress TO service_role;
ALTER TABLE public.problem_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.problem_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.problem_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.problem_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON public.problem_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER problems_updated_at BEFORE UPDATE ON public.problems FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED PROBLEMS
INSERT INTO public.problems (title, slug, description, difficulty, topic, input_format, output_format, constraints, examples, starter_code) VALUES
('Two Sum','two-sum','Given an array of integers and a target value, return the indices of the two numbers that add up to the target. Each input has exactly one solution and you may not use the same element twice.','Easy','Arrays','First line: array of integers. Second line: the integer target.','Two indices as a list, e.g. [0, 1].','2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9',
'[{"input":"nums = [2,7,11,15], target = 9","output":"[0,1]","explanation":"nums[0] + nums[1] == 9"},{"input":"nums = [3,2,4], target = 6","output":"[1,2]","explanation":"nums[1] + nums[2] == 6"}]',
'{"python":"def two_sum(nums, target):\n    # Your code here\n    pass\n","javascript":"function twoSum(nums, target) {\n  // Your code here\n}\n","typescript":"function twoSum(nums: number[], target: number): number[] {\n  // Your code here\n  return [];\n}\n","java":"class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}\n","cpp":"vector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n    return {};\n}\n","go":"func twoSum(nums []int, target int) []int {\n    // Your code here\n    return nil\n}\n"}'),
('Reverse String','reverse-string','Given a string, return the string reversed. Try to do it in place where the language allows it.','Easy','Strings','A single line containing the string.','The reversed string.','1 <= s.length <= 10^5',
'[{"input":"s = \"hello\"","output":"\"olleh\""},{"input":"s = \"Destination\"","output":"\"noitanitseD\""}]',
'{"python":"def reverse_string(s):\n    # Your code here\n    pass\n","javascript":"function reverseString(s) {\n  // Your code here\n}\n","typescript":"function reverseString(s: string): string {\n  // Your code here\n  return \"\";\n}\n","java":"class Solution {\n    public String reverseString(String s) {\n        return \"\";\n    }\n}\n","cpp":"string reverseString(string s) {\n    // Your code here\n    return s;\n}\n","go":"func reverseString(s string) string {\n    // Your code here\n    return s\n}\n"}'),
('Valid Parentheses','valid-parentheses','Given a string containing only the characters ()[]{}, determine if the input string is valid. Brackets must close in the correct order.','Easy','Stack','A single line containing the bracket string.','true or false.','1 <= s.length <= 10^4',
'[{"input":"s = \"()[]{}\"","output":"true"},{"input":"s = \"(]\"","output":"false"}]',
'{"python":"def is_valid(s):\n    # Your code here\n    pass\n","javascript":"function isValid(s) {\n  // Your code here\n}\n","typescript":"function isValid(s: string): boolean {\n  // Your code here\n  return false;\n}\n","java":"class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}\n","cpp":"bool isValid(string s) {\n    // Your code here\n    return false;\n}\n","go":"func isValid(s string) bool {\n    // Your code here\n    return false\n}\n"}'),
('Binary Search','binary-search','Given a sorted array of integers and a target, return the index of the target or -1 if it does not exist. Your solution must run in O(log n) time.','Easy','Searching','First line: sorted array. Second line: target integer.','Index of target, or -1.','1 <= nums.length <= 10^4',
'[{"input":"nums = [-1,0,3,5,9,12], target = 9","output":"4"},{"input":"nums = [-1,0,3,5,9,12], target = 2","output":"-1"}]',
'{"python":"def search(nums, target):\n    # Your code here\n    pass\n","javascript":"function search(nums, target) {\n  // Your code here\n}\n","typescript":"function search(nums: number[], target: number): number {\n  return -1;\n}\n","java":"class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}\n","cpp":"int search(vector<int>& nums, int target) {\n    return -1;\n}\n","go":"func search(nums []int, target int) int {\n    return -1\n}\n"}'),
('Maximum Subarray','maximum-subarray','Given an integer array, find the contiguous subarray with the largest sum and return that sum.','Medium','Arrays','A single line containing the array of integers.','The maximum subarray sum.','1 <= nums.length <= 10^5',
'[{"input":"nums = [-2,1,-3,4,-1,2,1,-5,4]","output":"6","explanation":"[4,-1,2,1] has the largest sum."},{"input":"nums = [1]","output":"1"}]',
'{"python":"def max_sub_array(nums):\n    # Your code here\n    pass\n","javascript":"function maxSubArray(nums) {\n  // Your code here\n}\n","typescript":"function maxSubArray(nums: number[]): number {\n  return 0;\n}\n","java":"class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}\n","cpp":"int maxSubArray(vector<int>& nums) {\n    return 0;\n}\n","go":"func maxSubArray(nums []int) int {\n    return 0\n}\n"}'),
('Contains Duplicate','contains-duplicate','Given an integer array, return true if any value appears at least twice, and false if every element is distinct.','Easy','Hash Maps','A single line containing the array of integers.','true or false.','1 <= nums.length <= 10^5',
'[{"input":"nums = [1,2,3,1]","output":"true"},{"input":"nums = [1,2,3,4]","output":"false"}]',
'{"python":"def contains_duplicate(nums):\n    # Your code here\n    pass\n","javascript":"function containsDuplicate(nums) {\n  // Your code here\n}\n","typescript":"function containsDuplicate(nums: number[]): boolean {\n  return false;\n}\n","java":"class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}\n","cpp":"bool containsDuplicate(vector<int>& nums) {\n    return false;\n}\n","go":"func containsDuplicate(nums []int) bool {\n    return false\n}\n"}'),
('Palindrome Checker','palindrome-checker','Given a string, return true if it reads the same forwards and backwards after removing non-alphanumeric characters and ignoring case.','Easy','Strings','A single line containing the string.','true or false.','1 <= s.length <= 2 * 10^5',
'[{"input":"s = \"A man, a plan, a canal: Panama\"","output":"true"},{"input":"s = \"race a car\"","output":"false"}]',
'{"python":"def is_palindrome(s):\n    # Your code here\n    pass\n","javascript":"function isPalindrome(s) {\n  // Your code here\n}\n","typescript":"function isPalindrome(s: string): boolean {\n  return false;\n}\n","java":"class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}\n","cpp":"bool isPalindrome(string s) {\n    return false;\n}\n","go":"func isPalindrome(s string) bool {\n    return false\n}\n"}'),
('Fibonacci Number','fibonacci-number','Calculate the nth Fibonacci number, where F(0) = 0, F(1) = 1 and F(n) = F(n-1) + F(n-2).','Easy','Arrays','A single integer n.','The nth Fibonacci number.','0 <= n <= 30',
'[{"input":"n = 4","output":"3","explanation":"F(4) = F(3) + F(2) = 2 + 1 = 3"},{"input":"n = 2","output":"1"}]',
'{"python":"def fib(n):\n    # Your code here\n    pass\n","javascript":"function fib(n) {\n  // Your code here\n}\n","typescript":"function fib(n: number): number {\n  return 0;\n}\n","java":"class Solution {\n    public int fib(int n) {\n        return 0;\n    }\n}\n","cpp":"int fib(int n) {\n    return 0;\n}\n","go":"func fib(n int) int {\n    return 0\n}\n"}'),
('Merge Sorted Arrays','merge-sorted-arrays','Given two sorted integer arrays, merge them into a single sorted array.','Medium','Sorting','Two lines, each containing a sorted array of integers.','A single merged sorted array.','0 <= m, n <= 200',
'[{"input":"a = [1,2,3], b = [2,5,6]","output":"[1,2,2,3,5,6]"},{"input":"a = [], b = [1]","output":"[1]"}]',
'{"python":"def merge_sorted(a, b):\n    # Your code here\n    pass\n","javascript":"function mergeSorted(a, b) {\n  // Your code here\n}\n","typescript":"function mergeSorted(a: number[], b: number[]): number[] {\n  return [];\n}\n","java":"class Solution {\n    public int[] mergeSorted(int[] a, int[] b) {\n        return new int[]{};\n    }\n}\n","cpp":"vector<int> mergeSorted(vector<int>& a, vector<int>& b) {\n    return {};\n}\n","go":"func mergeSorted(a []int, b []int) []int {\n    return nil\n}\n"}'),
('Longest Substring Without Repeating Characters','longest-substring-without-repeating-characters','Given a string, find the length of the longest substring without repeating characters.','Hard','Hash Maps','A single line containing the string.','Length of the longest substring.','0 <= s.length <= 5 * 10^4',
'[{"input":"s = \"abcabcbb\"","output":"3","explanation":"The answer is \"abc\"."},{"input":"s = \"bbbbb\"","output":"1"}]',
'{"python":"def length_of_longest_substring(s):\n    # Your code here\n    pass\n","javascript":"function lengthOfLongestSubstring(s) {\n  // Your code here\n}\n","typescript":"function lengthOfLongestSubstring(s: string): number {\n  return 0;\n}\n","java":"class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}\n","cpp":"int lengthOfLongestSubstring(string s) {\n    return 0;\n}\n","go":"func lengthOfLongestSubstring(s string) int {\n    return 0\n}\n"}'),
('Binary Tree Depth','binary-tree-depth','Given the root of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to the farthest leaf.','Medium','Trees','A binary tree given in level order, e.g. [3,9,20,null,null,15,7].','The maximum depth as an integer.','0 <= number of nodes <= 10^4',
'[{"input":"root = [3,9,20,null,null,15,7]","output":"3"},{"input":"root = [1,null,2]","output":"2"}]',
'{"python":"def max_depth(root):\n    # Your code here\n    pass\n","javascript":"function maxDepth(root) {\n  // Your code here\n}\n","typescript":"function maxDepth(root: any): number {\n  return 0;\n}\n","java":"class Solution {\n    public int maxDepth(TreeNode root) {\n        return 0;\n    }\n}\n","cpp":"int maxDepth(TreeNode* root) {\n    return 0;\n}\n","go":"func maxDepth(root *TreeNode) int {\n    return 0\n}\n"}');
