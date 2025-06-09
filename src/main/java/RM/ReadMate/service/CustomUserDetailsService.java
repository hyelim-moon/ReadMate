package RM.ReadMate.service;

import RM.ReadMate.entity.User;
import RM.ReadMate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // userid를 기준으로 User 조회
    @Override
    public UserDetails loadUserByUsername(String userid) throws UsernameNotFoundException {
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with userid: " + userid));

        // ROLE_USER만 예시로 부여
        return new org.springframework.security.core.userdetails.User(
                user.getUserid(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
}