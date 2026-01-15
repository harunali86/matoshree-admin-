select routine_name 
from information_schema.routines 
where routine_type = 'FUNCTION' 
and routine_schema = 'public';
